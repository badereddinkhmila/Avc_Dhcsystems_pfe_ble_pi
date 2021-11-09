'use strict';

var _noble = require('noble');

var _noble2 = _interopRequireDefault(_noble);

var _dbHelpers = require('./dbHelpers');

var _mqttHelpers = require('./mqttHelpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var clientId = 'Yassine_Gateway_RBP_3B+';
var connectUrl = 'tcp://192.168.1.232:1883/mqtt';
//const connectUrl = 'tcp://192.168.1.13:1883/mqtt'


var dbhelper = new _dbHelpers.dbHelpers();
dbhelper.initTables();

var mqtthelper = new _mqttHelpers.mqttHelpers(clientId, connectUrl);

mqtthelper.broker.on("connect", function () {
    mqtthelper.checkDB();
});

mqtthelper.broker.on("reconnect", function () {
    console.log('reconnecting to mqtt...');
});

_noble2.default.on('stateChange', function (state) {
    if (state === 'poweredOn') {
        console.log('Powered On');
        _noble2.default.startScanning([], true);
    }
});

_noble2.default.on('scanStart', function () {
    console.log('scan start');
});

_noble2.default.on('scanStop', function () {
    console.log('scan stopped');
});

var devices = [];

_noble2.default.on('discover', function (device) {
    var localName = device.advertisement.localName;
    console.log(device.advertisement.serviceData, device.advertisement.serviceUuids);
    console.log(devices.indexOf(device.advertisement.localName));
    console.log('discovered: ', device.address);
    if (localName !== undefined && localName !== "") {
        device.on('connect', function () {
            console.log('connected to', device.address);
            devices.push(device.address);
            device.discoverAllServicesAndCharacteristics(function (error, services, characteristics) {
                services.forEach(function (service, chId) {
                    console.log('Uuid:' + service.uuid);
                });
                var heart = null;
                var temp = null;
                var bp = null;
                characteristics.forEach(function (ch, chId) {
                    console.log('Uuid:' + ch.uuid, 'Name:' + ch.name, 'Properties:' + ch.properties);
                    if (ch.name !== null && ch.name.includes("Heart Rate Meas")) {
                        //heart=ch  
                    }
                    if (ch.name !== null && ch.name.includes("Temperature Measurement")) {
                        console.log('subscribed to temperature service');
                        temp = ch;
                    }

                    if (ch.name !== null && ch.name.includes("Blood Pressure Measurement")) {
                        console.log('subscribed to blood pressure service');
                        bp = ch;
                    }
                });
                if (heart !== null) {
                    console.log('type: ', heart.name);
                    heart.subscribe(function (error) {
                        console.log('in subs');
                        if (error) {
                            console.log('my error: ', error);
                        }
                    });
                    heart.on('data', function (data, isNotification) {
                        //let mydata=Buffer.from(data)
                        console.log(data.toJSON()['data']);
                    });
                }
                if (bp !== null) {
                    bp.subscribe(function (error) {
                        console.log('in subs');
                        if (error) {
                            console.log('my error: ', error);
                        }
                    });
                    bp.on('data', function (data, isNotification) {
                        console.log(data);
                        var my_data = data.toJSON()['data'];
                        var time = Math.trunc(Date.now() / 1000);
                        var msg = { 'diastolic': my_data[1], 'pulse': my_data[14],
                            'systolic': my_data[3], 'collect_time': time };
                        if (mqtthelper.broker.connected) {
                            console.log('Sendig through the broker');
                            mqtthelper.sendBP(msg);
                        } else {
                            console.log('Falling to sqlite3 local storage');
                            dbhelper.insertBP(msg).then(function (resp) {
                                console.log(resp);
                            });
                        }
                    });
                }
                if (temp !== null) {
                    console.log('type: ', temp.name);
                    temp.subscribe(function (error) {
                        if (error) {
                            console.log('my error:', error);
                        }
                    });
                    temp.on('data', function (data, isNotification) {
                        console.log(data);
                        var value = (37 + Math.random()).toFixed(2);
                        var time = Math.trunc(Date.now() / 1000);
                        var msg = { 'temperature': value, 'collect_time': time };
                        if (mqtthelper.broker.connected) {
                            console.log('Sendig through the broker');
                            mqtthelper.sendTemperature(msg);
                        } else {
                            console.log('Falling to sqlite3 local storage');
                            dbhelper.insertTemp(msg).then(function (resp) {
                                console.log(resp);
                            });
                        }
                    });
                }
            });
        });

        if (devices.indexOf(device.address) == -1) {
            device.connect(function (error) {
                if (error) {
                    console.log(error);
                }
                console.log(device.address, 'connected!!');
                _noble2.default.startScanning();
            });
            device.on('disconnect', function (error) {
                if (error) console.log(error);
                devices.pop(device.address);
            });
        }
    }
});
//# sourceMappingURL=app.js.map