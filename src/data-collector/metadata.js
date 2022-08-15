/*
 Copyright 2021 Siemens AG
This file is subject to the terms and conditions of the MIT License.  
See LICENSE file in the top-level directory.
*/

/*#################################
    Requirements 
#################################*/
const mqtt = require('mqtt');

const MQTT = require('./global').MQTT

/*#################################
    Define Variables
#################################*/
let nameIdMap = new Map();
let idNameMap = new Map();

/*#################################
    MQTT Connection (IE Databus)
#################################*/

/* MQTT Connection Option */
const options = {
    'clientId': 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    'protocolId': 'MQTT',
    'username': MQTT.USERNAME,
    'password': MQTT.PASSWORD
}

/* Connect MQTT-Client to MQTT Broker (IE Databus) */
var client = mqtt.connect('mqtt://' + MQTT.HOST, options);

/* Subscribe to Topic after connection is established */
client.on('connect', () => {
    console.log('Metadata: MQTT: Connected to ' + MQTT.HOST);
    client.subscribe(MQTT.DEFAULT_METADATA_TOPIC_NAME, () => {
        console.log('Metadata: MQTT: Subscribed to ' + MQTT.DEFAULT_METADATA_TOPIC_NAME);
    });
});

/* Parse Metadata after received message*/
client.on('message', function (topic, message) {
    msg = message.toString()
    console.log(`Metadata: MQTT: Received message ${msg} on MQTT-Topic ${topic}`)
    // parse Metadata
    if (topic === MQTT.DEFAULT_METADATA_TOPIC_NAME) {
        console.log(`Metadata: MQTT: topic matches`)
        var jsonmsg = JSON.parse(msg);
        // Iterate through connections
        jsonmsg.connections.forEach(connection => {
            if ((connection.name == MQTT.DATA_SOURCE_NAME)) {
                console.log(`Metadata: MQTT: Connection name matches`)
                let dataPoints = connection.dataPoints;

                //  Iterate through dataPoints
                dataPoints.forEach(dataPoint => {
                    let dataPointDefinitions = dataPoint.dataPointDefinitions;

                    // Iterate through dataPointDefinitions
                    dataPointDefinitions.forEach(dataPointDefinition => {
                        console.log(dataPointDefinition.name + ': ' + dataPointDefinition.id)
                        nameIdMap.set(dataPointDefinition.name, dataPointDefinition);
                        idNameMap.set(dataPointDefinition.id, dataPointDefinition)
                    });
                });
            }
        });
    }
});

/*#################################
    Export Variables
#################################*/
module.exports = {
    "NAME_ID_MAP": nameIdMap,
    "ID_NAME_MAP": idNameMap
}