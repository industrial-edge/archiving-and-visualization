/*
Copyright 2023 Siemens AG
This file is subject to the terms and conditions of the MIT License.  
See LICENSE file in the top-level directory.
*/

/*#################################
    Requirements 
#################################*/
const { InfluxDB, Point } = require("@influxdata/influxdb-client");
const mqtt = require("mqtt");
const { getMetadata } = require("./metadata");

const INFLUXDB = require("./global").INFLUXDB;
const MQTT = require("./global").MQTT;

/*#################################
    Define Variables 
#################################*/
let METADATA = {};

/*#################################
    InfluxDB Connection
#################################*/

/* define influxdb */
const influx = new InfluxDB({
  url: INFLUXDB.HOST + ":" + INFLUXDB.PORT,
  token: INFLUXDB.TOKEN,
});
const writeApi = influx.getWriteApi(INFLUXDB.ORG, INFLUXDB.BUCKET);
writeApi.useDefaultTags({ host: "plc_data" });

/*#################################
    MQTT Connection (IE Databus)
#################################*/

/* MQTT Connection Option */
const options = {
  clientId: "mqttjs_" + Math.random().toString(16).slice(2, 10),
  protocolId: "MQTT",
  username: MQTT.USERNAME,
  password: MQTT.PASSWORD,
};

/* Connect MQTT-Client to MQTT Broker (IE Databus) */
var client = mqtt.connect("mqtt://" + MQTT.HOST, options);

/* Subscribe to Topic after connection is established */
client.on("connect", async () => {
  console.log("Data-Collector: MQTT: Connected to " + MQTT.HOST);

  getMetadata.then((metadata) => {
    METADATA = metadata;
    client.subscribe(METADATA.DATA_POINT_TOPIC, () => {
      console.log(
        "Data-Collector: MQTT: Subscribed to " + METADATA.DATA_POINT_TOPIC
      );
    });
  }).catch((error) => {
    console.error(
      `Data-Collector: Error getting metadata from MQTT! ${error.stack}`
    );
  });
})


/* Write Data to InfluxDB after received message*/
client.on("message", async function (topic, message) {
  msg = message.toString();
  console.log(
    `Data-Collector: MQTT: Received message ${msg} on MQTT-Topic ${topic} responding with corresponding answer`
  );
  // write msg to influx
  if (topic !== METADATA.DATA_POINT_TOPIC) return;

  let jsonMsg = JSON.parse(msg);

  // subDpValueSimaticV1Paylod Format
  if (jsonMsg.vals) {
    try {
      writeApi.writePoints(
        jsonMsg.vals.map((tag) => {
          let timestamp = tag.ts ? new Date(tag.ts) : new Date(jsonMsg.ts);
          return new Point(METADATA.ID_NAME_MAP.get(tag.id))
            .floatField("value", Number(tag.val))
            .timestamp(timestamp);
        })
      );
      await writeApi.flush();
    } catch (error) {
      console.error(
        `Data-Collector: Error saving data to InfluxDB! ${error.stack}`
      );
    }
  }
  // subDpValueSimaticV11TimeSeriesPayload Format
  else if (jsonMsg.records) {
    jsonMsg.records.forEach(async (element) => {
      try {
        writeApi.writePoints(
          element.vals.map((tag) => {
            let timestamp = tag.ts ? new Date(tag.ts) : new Date(element.ts);
            return new Point(METADATA.ID_NAME_MAP.get(tag.id))
              .floatField("value", Number(tag.val))
              .timestamp(timestamp);
          })
        );
        await writeApi.flush();
      } catch (error) {
        console.error(
          `Data-Collector: Error saving data to InfluxDB" ${error.stack}`
        );
      }
    });
  } else {
    console.log(`Unsupported format: ${jsonMsg}`);
  }
});
