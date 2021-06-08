/*
Copyright 2020 Siemens AG
This file is subject to the terms and conditions of the MIT License.
See LICENSE file in the top-level directory.
*/

const Influx = require('influx');
const mqtt = require('mqtt');

const INFLUXDB = require('./global').INFLUXDB
const MQTT = require('./global').MQTT
const METADATA = require('./metadata')

/*#################################
    Define Variables
#################################*/
const mqttDataTopic = MQTT.DEFAULT_TOPIC_NAME + 'r/' + MQTT.DATA_SOURCE_NAME + '/default'

/*
const pathConfig = '/cfg-data/env-config.json';

let configbuffer = fs.readFileSync(pathConfig);
console.log("configbuffer: " + configbuffer);
envconfig = JSON.parse(configbuffer);


// Init Env Variables 
const MQTT_IP = envconfig.env.MQTT_BROKER_SERVER || 'ie-databus';
const MQTT_TOPIC = envconfig.env.MQTT_TOPIC || 'ie/d/j/simatic/v1/s7c1/dp/r/';
const DATA_SOURCE_NAME = envconfig.env.DATA_SOURCE_NAME || 'PLC_1/default';
const MQTT_USER = envconfig.env.MQTT_USER || 'edge';
const MQTT_PASSWORD = envconfig.env.MQTT_PASSWORD || 'edge';
const INFLUXDB_IP = envconfig.env.INFLUXDB_IP || 'influxdb';
const INFLUXDB_DATABASE = envconfig.env.INFLUXDB_DATABASE || 'databus_values';
*/

//read from databus
/* MQTT Connection Option */
const options = {
  'clientId': 'mqttjs_' + Math.random().toString(16).substr(2, 8),
  'protocolId': 'MQTT',
  'username': MQTT.USERNAME,
  'password': MQTT.PASSWORD
}

/* Connect MQTT-Client to Databus (MQTT-Broker) */
var client = mqtt.connect('mqtt://' + MQTT.HOST, options);

/* Subscribe to Topic after connection is established */
client.on('connect', () => {
  console.log('Connected to ' + MQTT.HOST);
  client.subscribe(mqttDataTopic, () => {
    console.log('Data-Collector: MQTT: Subscribed to ' + mqttDataTopic);
  });
});

/* Write Data to InfluxDB after recieved message*/
client.on('message', function (topic, message) {
  msg = message.toString()
  console.log(`Data-Collector: MQTT: Recieved message ${msg} on MQTT-Topic ${topic} responding with corresponding answer`)
  // write msg to influx
  if (topic === mqttDataTopic) {
    var jsonmsg = JSON.parse(msg);
    jsonmsg.vals.forEach(element => {
      influx.writePoints([
        {
          measurement: METADATA.ID_NAME_MAP.get(element.id),
          fields: { value: Number(element.val) },
        }
      ]).catch(error => {
        console.error(`Data-Collector: Error saving data to InfluxDB! ${error.stack}`)
      })
    })
  }
});

/*#################################
    InfluxDB Connection
#################################*/

/* define influxdb */
const influx = new Influx.InfluxDB({
  host: INFLUXDB.HOST,
  database: INFLUXDB.DATABASE,
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

/* Create InfluxDB Database*/
createDatabase = async (influx, influxdbDatabase) => {
  i = 0
  do {
    await delay(5000);
    hosts = await influx.ping(5000)
    console.log(hosts)
    i++;
    console.log(`Data-Collector: Try to connect to InfluxDB: try number ${i}`)
    console.log(`Data-Collector: influxdb Status: ${hosts[0].online}`)
  } while (!hosts[0].online)
  console.log("Data-Collector: Influx DB online");
  influx.createDatabase(influxdbDatabase)
}

createDatabase(influx, INFLUXDB.DATABASE).then(res => {
  console.log("Data-Collector: Database created");
});
