/*
Copyright 2020 Siemens AG
This file is subject to the terms and conditions of the MIT License.
See LICENSE file in the top-level directory.
*/

const fs = require('fs');
const Influx = require('influx');
const mqtt = require('mqtt');

const pathConfig = '/cfg-data/env-config.json';

let configbuffer = fs.readFileSync(pathConfig);
console.log("configbuffer: " + configbuffer);
envconfig = JSON.parse(configbuffer);


/* Init Env Variables */
const MQTT_IP = envconfig.env.MQTT_BROKER_SERVER || 'ie-databus';
const MQTT_TOPIC = envconfig.env.MQTT_TOPIC || 'ie/d/j/simatic/v1/s7c1/dp/r/';
const DATA_SOURCE_NAME = envconfig.env.DATA_SOURCE_NAME || 'PLC_1/default';
const MQTT_USER = envconfig.env.MQTT_USER || 'edge';
const MQTT_PASSWORD = envconfig.env.MQTT_PASSWORD || 'edge';
const INFLUXDB_IP = envconfig.env.INFLUXDB_IP || 'influxdb';
const INFLUXDB_DATABASE = envconfig.env.INFLUXDB_DATABASE || 'databus_values';

//read from databus
/* MQTT Connection Option */
const options = {
    'clientId': 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    'protocolId': 'MQTT',
    'username': MQTT_USER,
    'password': MQTT_PASSWORD
}

/* Connect MQTT-Client to Databus (MQTT-Broker) */
var client = mqtt.connect('mqtt://' + MQTT_IP, options);

/* Subscribe to Topic after connection is established */
client.on('connect', () => {
    console.log('Connected to ' + MQTT_IP);
    client.subscribe(MQTT_TOPIC+DATA_SOURCE_NAME, () =>  {
        console.log('Subscribed to ' + MQTT_TOPIC+DATA_SOURCE_NAME);
    });
});

//define influxdb
const influx = new Influx.InfluxDB({
  host: INFLUXDB_IP,
  database: INFLUXDB_DATABASE,
  port: 8086,
  username: 'root',
  password: 'root',
  schema: [
    {
      measurement: "uihqiuwhe",
      fields: {
        value: Influx.FieldType.FLOAT
      },
      tags: [
        'host'
      ]
    }
  ]
})


const delay = ms => new Promise(res => setTimeout(res, ms));

createDatabase = async (influx, influxdbDatabase) => {
  i = 0
  do {
    await delay(5000);
    hosts = await influx.ping(5000)
    console.log(hosts)
    i++;
    console.log(`Try to connect to InfluxDB: try number ${i}`)
    console.log(`influxdb Status: ${hosts[0].online}`)
  } while (!hosts[0].online)
  console.log("Influx DB online");
  influx.createDatabase(influxdbDatabase)
} 

createDatabase(influx, INFLUXDB_DATABASE).then(res => {
  console.log("Database created");
})


/*
//create database
function createDatabase() {
  influx.createDatabase(INFLUXDB_DATABASE)
  console.log("database created");
}

//wait 12 seconds before creating database (influx container needs a while to initialize)
setTimeout(createDatabase, 12000);
*/

/* Publish response after recieved message*/
client.on('message', function (topic, message) {
    msg = message.toString()
    console.log(`Recieved message ${msg} on MQTT-Topic ${MQTT_TOPIC+DATA_SOURCE_NAME} responding with corresponding answer`)
    //write msg to influx
    var jsonmsg = JSON.parse(msg);
    console.log("received objects: ");
    console.log(jsonmsg.vals);
    jsonmsg.vals.forEach(element => { 
      influx.writePoints([
          {
            measurement: element.id,
            fields: { value: Number(element.val) },
          }
        ])
        .catch(error => {
          console.error(`Error saving data to InfluxDB! ${error.stack}`)
        })
      })
});
