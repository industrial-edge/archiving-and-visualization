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
const mqttDataTopic = MQTT.DEFAULT_TOPIC_NAME;

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

/* Write Data to InfluxDB after received message*/
client.on('message', function (topic, message) {
  msg = message.toString()
  //console.log(`Data-Collector: MQTT: Received message ${msg} on MQTT-Topic ${topic} responding with corresponding answer`)
  // write msg to influx
  if (topic === mqttDataTopic) {
    const jsonmsg = JSON.parse(msg);
    const points = [];
 
    // timeseries publish format
    if(jsonmsg.records) {
      // new database format: one measurement, all tags are fields
      for(const record of jsonmsg.records) {
        const ts = PayloadValueDecoder.timeStringToNs(record.ts);
        const point = {
          measurement: MQTT.DATA_SOURCE_NAME,
          timestamp: ts,
          fields: {}
        };
        let fieldCount = 0;
        for(const element of record.vals) {
          const dp = METADATA.ID_NAME_MAP.get(element.id);
          if(dp) {
            if(dp.valueRank === undefined
              || dp.valueRank == -1
              || (dp.valueRank <= -2 && element.val.length === undefined))
            {
              // scalar value
              point.fields[dp.name] = PayloadValueDecoder.decodeValue(element.val, dp.dataType);
              fieldCount++;
            }
            else {
              // array value
              // TODO: support sample_rate
              // TODO: support multidim arrays
              const arrLength = element.val.length
              if(dp.arrayDimensions && dp.arrayDimensions.length == 1 && arrLength > 0) {
                for(let i = 0; i < arrLength; i++) {
                  point.fields[`${dp.name}[${i}]`] = PayloadValueDecoder.decodeValue(element.val[i], dp.dataType);
                  fieldCount++;
                }
              }
            }
          }
        }
        if(fieldCount > 0) {
          points.push(point);
        }
      }
    }

    // bulk publish format
    else if(jsonmsg.vals) {
      let globalTs;
      if(jsonmsg.ts) {
        globalTs = PayloadValueDecoder.timeStringToNs(jsonmsg.ts);
      }
      // group the elements by timestamps; all identical timestamps will be put into the same point
      let fields_by_ts = new Map();
      for(const element of jsonmsg.vals) {
        const dp = METADATA.ID_NAME_MAP.get(element.id);
        if(dp) {
          const ts = element.ts ? PayloadValueDecoder.timeStringToNs(element.ts) : globalTs;
          if(ts) {
            let fields = fields_by_ts.get(ts);
            if(!fields) {
              fields = {};
              fields_by_ts.set(ts, fields);
            }
            // TODO: support arrays
            // TODO: support multidim arrays
            // TODO: support sample_rate
            fields[dp.name] = PayloadValueDecoder.decodeValue(element.val, dp.dataType);
          }
        }
      }
      for(let entry of fields_by_ts.entries()) {
        const point = {
          measurement: MQTT.DATA_SOURCE_NAME,
          timestamp: entry[0],
          fields: entry[1]
        };
        points.push(point);
      }
    }

    if(points.length > 0) {
      influx.writePoints(points).catch(error => {
        console.error(`Data-Collector: Error saving data to InfluxDB! ${error.stack}`);
      });
    }
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

// convert a ISO8601 timestring in UTC to nanoseconds while preserving
// sub milliseconds precision
/*
const time_parse_re = /^(.*)\.([0-9]{1,9}+)/;
const fill_time_fract_len_to_ns = [
  '', // not possible because of regex
  '00000000',
  '0000000',
  '000000',
  '00000',
  '0000',
  '000',
  '00',
  '0',
  ''
];
function timeStringToNsOld(timestr) {
  let ns = 0;
  const m = timestr.match(time_parse_re);
  const msecs = (new Date(m[1] + 'Z')).valueOf(); // the full seconds in units of milliseconds
  let fract = m[2];
  if(fract) {
    fract += fill_time_fract_len_to_ns[fract.length]; // make sure the number of digits is 9
    ns = Number(fract);
    if(Number.isNaN(ns)) {
      ns = 0;
    }
  }
  return ns + 1e6 * msecs;
}
*/

class PayloadValueDecoder {
  static payloadTypeToDecoderFct = {
    'Bool': PayloadValueDecoder.decodeBool,
    'Byte': PayloadValueDecoder.decodeNumber,
    'Word': PayloadValueDecoder.decodeNumber,
    'DWord': PayloadValueDecoder.decodeNumber,
    'LWord': PayloadValueDecoder.decodeUInt64,
    'SInt': PayloadValueDecoder.decodeNumber,
    'USInt': PayloadValueDecoder.decodeNumber,
    'Int': PayloadValueDecoder.decodeNumber,
    'UInt': PayloadValueDecoder.decodeNumber,
    'DInt': PayloadValueDecoder.decodeNumber,
    'UDInt': PayloadValueDecoder.decodeNumber,
    'LInt': PayloadValueDecoder.decodeInt64,
    'ULInt': PayloadValueDecoder.decodeUInt64,
    'Real': PayloadValueDecoder.decodeNumber,
    'LReal': PayloadValueDecoder.decodeNumber,
    'Char': PayloadValueDecoder.decodeString,
    'String': PayloadValueDecoder.decodeString,
    'Time': PayloadValueDecoder.decodeInt64,
    'LTime': PayloadValueDecoder.decodeInt64,
    'DateTime': PayloadValueDecoder.decodeTimestampToNanoseconds,
    'Date': PayloadValueDecoder.decodeTimestampToNanoseconds,
    'Time_Of_Day': PayloadValueDecoder.decodeInt64,
    'LTime_Of_Day': PayloadValueDecoder.decodeInt64
  };

  static factors_time_fract_to_ns = [
    0, // not possible because of regex
    100000000,
    10000000,
    1000000,
    100000,
    10000,
    1000,
    100,
    10,
    1
  ];
  
  static time_parse_re = /^([0-9]{4}-[0-9]{1,2}-[0-9]{1,2}T[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})(\.([0-9]{1,9})?)?Z$/;
  
  static decodeValue(vin, iedb_type, useBigInt) {
    const conv_fct = PayloadValueDecoder.payloadTypeToDecoderFct[iedb_type];
    if(conv_fct) {
      return conv_fct(vin, useBigInt);
    }
    return undefined;
  }

  static decodeBool(vin) {
    if(vin === '1' || vin == 1) {
      return true;
    }
    return false;
  }

  // can return NaN
  static decodeNumber(vin) {
    if(typeof vin === 'string')
    {
      return Number(vin);
    }
    return vin;
  }
    
  // can return NaN and undefined
  static decodeUInt64(vin, useBigInt) {
    if(useBigInt) {
      return PayloadValueDecoder.decodeBigInt(vin);
    }
    else {
      if(typeof vin === 'string')
      {
        return Number(vin);
      }
    }
    return vin;
  }

  // can return NaN
  static decodeInt64(vin, useBigInt) {
    return PayloadValueDecoder.decodeUInt64(vin, useBigInt);
  }

  // can return undefined
  static decodeBigInt(vin) {
    let v;
    try {
      v = BigInt(vin);
    }
    catch(e) {
      // v is already 'undefined'
    }

    return v;
  }

  static decodeString(vin) {
    return vin;
  }

  static decodeTimestampToNanoseconds(vin, useBigInt) {
    return PayloadValueDecoder.timeStringToNs(vin, useBigInt);
  }

  static timeStringToNs(timestr, useBigInt) {
    if(typeof timestr === "string") {
      let ns = 0;
      const regexmatch = timestr.match(PayloadValueDecoder.time_parse_re);
      if(regexmatch) {
        const msecs = (new Date(regexmatch[1] + 'Z')).valueOf(); // the full seconds in units of milliseconds
        const fract = regexmatch[3];
        if(fract) {
          const fractLen = fract.length;
          ns = Number(fract);
          if(Number.isNaN(ns)) {
            ns = 0; // should never happen because already verified by regex
          }
          else {
            ns *= PayloadValueDecoder.factors_time_fract_to_ns[fractLen]; // convert fraction to ns
          }
        }

        if(useBigInt) {
          return BigInt(ns) + (1000000n * BigInt(msecs));
        }
        else {
          return ns + (1000000 * msecs);
        }
      }
    }
    return undefined;
  }
}
