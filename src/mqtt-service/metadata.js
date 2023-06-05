/*
 Copyright 2023 Siemens AG
This file is subject to the terms and conditions of the MIT License.  
See LICENSE file in the top-level directory.
*/

/*#################################
    Requirements 
#################################*/
const mqtt = require("mqtt");
const MQTT = require("./global").MQTT;

/*#################################
    Define Variables
#################################*/
let nameIdMap = new Map();
let idNameMap = new Map();
let mqttDataTopic;
const regex = /(?:[^/]+)/gi;

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

function connectAndSubscribe() {
  /* Subscribe to Topic after connection is established */
  client.on("connect", () => {
    console.log("Metadata: MQTT: Connected to " + MQTT.HOST);
    client.subscribe(MQTT.METADATA_TOPIC_NAME, () => {
      console.log("Metadata: MQTT: Subscribed to " + MQTT.METADATA_TOPIC_NAME);
    });
  });
}

let getMetadata = new Promise((resolve, reject) => {
  // Get the metadata from the IE Databus
  connectAndSubscribe();

  /* parse metadata after received message*/
  client.on("message", function (topic, message) {
    msg = message.toString();
    console.log(
      `metadata: mqtt: received message ${msg} on mqtt-topic ${topic} responding with corresponding answer`
    );

    // parse metadata
    if (topic !== MQTT.METADATA_TOPIC_NAME) return;

    var jsonmsg = JSON.parse(msg);
    // check payload
    if (jsonmsg.seq == undefined) {
      return null;
    }

    // iterate through connections for the connection with the
    jsonmsg.connections.forEach((connection) => {
      if (connection.name != MQTT.DATA_SOURCE_NAME) {
        return;
      }

      let dataPoints = connection.dataPoints;
      // get the topic name from first datapoint (since opc ua connector is used, bulk mode is assumed)
      mqttDataTopic = dataPoints[0].topic;

      //  iterate through datapoints
      dataPoints.forEach((dataPoint) => {
        let dataPointDefinitions = dataPoint.dataPointDefinitions;

        // iterate through datapointdefinitions (tags)
        dataPointDefinitions.forEach((dataPointDefinition) => {
          console.log(dataPointDefinition.name + ": " + dataPointDefinition.id);
          nameIdMap.set(dataPointDefinition.name, dataPointDefinition.id);
          idNameMap.set(dataPointDefinition.id, dataPointDefinition.name);
        });
      });
    });

    // fallback in case data topic name could not be obtained
    if (!mqttDataTopic && MQTT.METADATA_TOPIC_NAME) {
      // replace metadata with data in topic name
      let occurrence = 0;
      mqttDataTopic = MQTT.METADATA_TOPIC_NAME.replace(
        regex,
        (match) => (++occurrence === 2 ? "d" : match)
      );

      // remove trailing slash if present
      if (mqttDataTopic.endsWith("/")) {
        mqttDataTopic = mqttDataTopic.slice(0, -1);
      }

      // add data source definition
      mqttDataTopic = `${mqttDataTopic}/r/${MQTT.DATA_SOURCE_NAME}/default`
    }
    // Disconnect
    client.end();
    // resolve promise
    resolve({
      NAME_ID_MAP: nameIdMap,
      ID_NAME_MAP: idNameMap,
      DATA_POINT_TOPIC: mqttDataTopic
    });
  });

  client.on("error", (error) => {
    console.log("Metadata: MQTT: Error: " + error);
    reject(error);
  });

});


/*#################################
    Export Promise
#################################*/
module.exports = {
  getMetadata
};
