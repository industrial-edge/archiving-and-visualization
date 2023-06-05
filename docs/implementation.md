# Implementation

- [Implementation](#implementation)
  - [App Configuration](#app-configuration)
    - [Bind-Mount Volume for configuration file](#bind-mount-volume-for-configuration-file)
    - [Default app configuration](#default-app-configuration)
    - [Read configuration file](#read-configuration-file)
  - [Connect to Databus](#connect-to-databus)
    - [MQTT-Client options](#mqtt-client-options)
    - [Connect MQTT-Client to Databus](#connect-mqtt-client-to-databus)
    - [Subscribe to Topics on Databus](#subscribe-to-topics-on-databus)
    - [Publish to Topic on Databus](#publish-to-topic-on-databus)
    - [On Message](#on-message)
  - [API with NodeJs and Express](#api-with-nodejs-and-express)
    - [Http Get-Request Endpoint](#http-get-request-endpoint)
    - [Start Webserver](#start-webserver)


## App Configuration

### Bind-Mount Volume for configuration file

```docker
volumes:
      - './publish/:/publish/'
      - './cfg-data/:/cfg-data/'
```

### Default app configuration

```js
const defaultConfiguration = {
    "MQTT": {
        "HOST": "ie-databus",
        "PORT": "1883",
        "USERNAME": "edge",
        "PASSWORD": "edge",
        "TOPIC_NAME": "ie/d/j/simatic/v1/opcuac1/dp",
        "METADATA_TOPIC_NAME": "ie/m/j/simatic/v1/opcuac1/dp",
        "DATA_SOURCE_NAME": "Tank"
    },
    "INFLUXDB": {
        "HOST": "http://influxdb:8086",
        "PORT": "8086",
        "ORG": "edge",
        "BUCKET": "databus_values",
        "TOKEN": "industrialedge"
    }
}
```

### Read configuration file

```js
const fileContent = JSON.parse(fs.readFileSync('/cfg-data/config-default.json', 'utf8') )
```

## Connect to Databus

### MQTT-Client options

```js
const options = {
    'clientId': 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    'protocolId': 'MQTT',
    'username': MQTT.USER,
    'password': MQTT.PASSWORD
}
```

### Connect MQTT-Client to Databus

```js
const mqttClient = mqtt.connect('mqtt://' + MQTT.SERVER_IP, options);
```

### Subscribe to Topics on Databus

```js
mqttClient.on('connect', () => {
    mqttClient.subscribe(mqttSubTopic, (err) => {
        if (!err) {
            console.log('Subscribed to ' + mqttSubTopic)
        }
    })
});
```

### Publish to Topic on Databus

```js
mqttClient.publish(mqttPubTopic, msg);
```

### On Message

```js
mqttClient.on('message', (topic, message) => {
    //do something
}
```

## API with NodeJs and Express

### Http Get-Request Endpoint

```js
app.get('/start', checkAuth, (req, res) => {
    //do something
})
```



### Start Webserver

```js
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})
```
