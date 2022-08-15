/*
 Copyright 2021 Siemens AG
This file is subject to the terms and conditions of the MIT License.  
See LICENSE file in the top-level directory.
*/


/*#################################
    Requirements 
#################################*/
const fs = require('fs')

/*#################################
    Define Variables
#################################*/
const configuration = require('./config/env-config.json')

/*#################################
    Init Programm using Configuration file
#################################*/
if (fs.existsSync('/cfg-data/config.json')) {
    console.log("Global: Configuration file exists => read configuration file")
    const configJson = JSON.parse(fs.readFileSync('/cfg-data/config.json', 'utf8') )
    console.log("Global: Configuration file: " + JSON.stringify(configJson))

    if (configJson.MQTT !== undefined) {
        configuration.MQTT.HOST = configJson.MQTT.HOST || configuration.MQTT.HOST;
        configuration.MQTT.PORT = Number(configJson.MQTT.PORT || configuration.MQTT.PORT);
        configuration.MQTT.USERNAME = configJson.MQTT.USERNAME || configuration.MQTT.USERNAME;
        configuration.MQTT.PASSWORD = configJson.MQTT.PASSWORD || configuration.MQTT.PASSWORD;
        configuration.MQTT.DATA_SOURCE_NAME = configJson.MQTT.DATA_SOURCE_NAME || configuration.MQTT.DATA_SOURCE_NAME;
        configuration.MQTT.DEFAULT_TOPIC_NAME = configJson.MQTT.DEFAULT_TOPIC_NAME || configuration.MQTT.DEFAULT_TOPIC_NAME;
        configuration.MQTT.DEFAULT_METADATA_TOPIC_NAME = configJson.MQTT.DEFAULT_METADATA_TOPIC_NAME || configuration.MQTT.DEFAULT_METADATA_TOPIC_NAME;
    }

    if (configJson.INFLUXDB !== undefined) {
        configuration.INFLUXDB.HOST = configJson.INFLUXDB.HOST || configuration.INFLUXDB.HOST
        configuration.INFLUXDB.PORT = Number(configuration.INFLUXDB.PORT)
        configuration.INFLUXDB.DATABASE = configJson.INFLUXDB.DATABASE || configuration.INFLUXDB.DATABASE
    }
    
} else {
    console.log("Global: No configuration file provided => use default configuration");
}

console.log("Global: App Configuration" + JSON.stringify(configuration))

/*#################################
    Export Variables
#################################*/
module.exports = {
    "MQTT": configuration.MQTT,
    "INFLUXDB": configuration.INFLUXDB,
}