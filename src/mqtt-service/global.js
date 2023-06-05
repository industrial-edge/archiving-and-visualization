/*
 Copyright 2023 Siemens AG
This file is subject to the terms and conditions of the MIT License.  
See LICENSE file in the top-level directory.
*/

/*#################################
    Requirements 
#################################*/
const fs = require("fs");

/*#################################
    Define Variables
#################################*/
const configuration = require("./config/config-default.json");

/*#################################
    Init Program using Configuration file
#################################*/
if (fs.existsSync("/cfg-data/config.json")) {
  console.log("Global: Configuration file exists => read configuration file");
  const configJson = JSON.parse(
    fs.readFileSync("/cfg-data/config.json", "utf8")
  );
  console.log("Global: Configuration file: " + JSON.stringify(configJson));

  if (configJson.MQTT !== undefined) {
    configuration.MQTT.HOST = configJson.MQTT.HOST || configuration.MQTT.HOST;
    configuration.MQTT.PORT = Number(
      configJson.MQTT.PORT || configuration.MQTT.PORT
    );
    configuration.MQTT.USERNAME =
      configJson.MQTT.USERNAME || configuration.MQTT.USERNAME;
    configuration.MQTT.PASSWORD =
      configJson.MQTT.PASSWORD || configuration.MQTT.PASSWORD;
    configuration.MQTT.METADATA_TOPIC_NAME =
      configJson.MQTT.METADATA_TOPIC_NAME ||
      configuration.MQTT.METADATA_TOPIC_NAME;
    configuration.MQTT.DATA_SOURCE_NAME =
      configJson.MQTT.DATA_SOURCE_NAME || configuration.MQTT.DATA_SOURCE_NAME;
  }

  if (configJson.INFLUXDB !== undefined) {
    configuration.INFLUXDB.HOST =
      configJson.INFLUXDB.HOST || configuration.INFLUXDB.HOST;
    configuration.INFLUXDB.PORT = Number(configuration.INFLUXDB.PORT);
    configuration.INFLUXDB.BUCKET =
      configJson.INFLUXDB.BUCKET || configuration.INFLUXDB.BUCKET;
    configuration.INFLUXDB.ORG =
      configJson.INFLUXDB.ORG || configuration.INFLUXDB.ORG;
    configuration.INFLUXDB.TOKEN =
      configJson.INFLUXDB.TOKEN || configuration.INFLUXDB.TOKEN;
  }
} else {
  console.log(
    "Global: No configuration file provided => using default configuration"
  );
}

console.log("Global: App Configuration" + JSON.stringify(configuration));

/*#################################
    Export Variables
#################################*/
module.exports = {
  MQTT: configuration.MQTT,
  INFLUXDB: configuration.INFLUXDB,
};
