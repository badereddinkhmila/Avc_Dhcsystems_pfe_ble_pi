'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.mqttHelpers = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mqtt = require('mqtt');

var _mqtt2 = _interopRequireDefault(_mqtt);

var _dbHelpers = require('./dbHelpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mqttHelpers = exports.mqttHelpers = function () {
    function mqttHelpers(clientId, Url) {
        _classCallCheck(this, mqttHelpers);

        this.clientId = clientId;
        this.Url = Url;
        this.broker = this.initBroker();
    }

    _createClass(mqttHelpers, [{
        key: 'initBroker',
        value: function initBroker() {
            var mqtt_options = {
                keepalive: 3600,
                clientId: this.clientId,
                clean: true,
                reconnectPeriod: 1000,
                connectTimeout: 30 * 1000
            };
            try {
                var client = _mqtt2.default.connect(this.Url, mqtt_options);
                console.log('mqtt broker connection state', client.connected);
                return client;
            } catch (e) {
                console.log('unable to connect');
            }
        }
    }, {
        key: 'checkDB',
        value: function checkDB() {
            var _this = this;

            var db = new _dbHelpers.dbHelpers();
            db.fetchFromDB().then(function (data) {
                if (data.length == 0) {
                    console.log("local database is empty");
                }

                var temp_len = data.temperature.length;
                var glu_len = data.glucose.length;
                var bp_len = data.bp.length;
                var oxy_len = data.oxygen;
                var weight_len = data.weight.length;

                if (temp_len !== 0) {
                    for (var i = 0; i < temp_len; i++) {
                        _this.sendTemperature(data.temperature[i]);
                        console.log(data.temperature[i]);
                    }
                } else if (glu_len !== 0) {
                    for (var _i = 0; _i < glu_len; _i++) {
                        _this.sendGlucose(data.glucose[_i]);
                    }
                } else if (oxy_len !== 0) {
                    for (var _i2 = 0; _i2 < oxy_len; _i2++) {
                        _this.sendOxygen(data.oxygen[_i2]);
                    }
                } else if (bp_len !== 0) {
                    for (var _i3 = 0; _i3 < bp_len; _i3++) {
                        _this.sendBP(data.bp[_i3]);
                    }
                } else if (weight_len !== 0) {
                    for (var _i4 = 0; _i4 < weight_len; _i4++) {
                        _this.sendWeight(data.weight[_i4]);
                    }
                }
                db.DeleteAll();
            });
        }
    }, {
        key: 'sendTemperature',
        value: function sendTemperature(data) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                try {
                    var msg = { 'gateway_id': _this2.clientId, 'collect_time': data.collect_time, 'temperature': data.temperature };
                    console.log(msg);
                    try {
                        _this2.broker.publish('avc/temperature', JSON.stringify(msg));
                        console.log('successfully sent temperature message');
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }
    }, {
        key: 'sendGlucose',
        value: function sendGlucose(data) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                try {
                    var msg = { 'gateway_id': _this3.clientId, 'collect_time': data.collect_time,
                        'mg_dl': data.mg_dl, 'mmol_l': data.mmol_l };
                    try {
                        _this3.broker.publish('avc/glucose', JSON.stringify(msg));
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }
    }, {
        key: 'sendOxygen',
        value: function sendOxygen(data) {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                try {
                    var msg = { 'gateway_id': _this4.clientId, 'collect_time': data.collect_time,
                        'pulse': data.pulse, 'spo2': data.spo2 };
                    try {
                        _this4.broker.publish('avc/oxygen', JSON.stringify(msg));
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }
    }, {
        key: 'sendBP',
        value: function sendBP(data) {
            var _this5 = this;

            return new Promise(function (resolve, reject) {
                try {
                    var msg = { 'gateway_id': _this5.clientId, 'collect_time': data.collect_time, 'diastolic': data.diastolic, 'pulse': data.pulse, 'systolic': data.systolic };
                    try {
                        _this5.broker.publish('avc/blood_pressure', JSON.stringify(msg));
                        console.log(msg);
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }
    }, {
        key: 'sendWeight',
        value: function sendWeight(data) {
            var _this6 = this;

            return new Promise(function (resolve, reject) {
                try {
                    var msg = { 'gateway_id': _this6.clientId, 'collect_time': data.collect_time,
                        'bmi': data.bmi, 'bodyfat': data.bodyfat, 'weight': data.weight };
                    try {
                        _this6.broker.publish('avc/weight', JSON.stringify(msg));
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }
    }]);

    return mqttHelpers;
}();
//# sourceMappingURL=mqttHelpers.js.map