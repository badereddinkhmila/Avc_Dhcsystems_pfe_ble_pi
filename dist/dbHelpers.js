'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.dbHelpers = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sqlite = require('sqlite3');

var _sqlite2 = _interopRequireDefault(_sqlite);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dbHelpers = exports.dbHelpers = function () {
    function dbHelpers() {
        _classCallCheck(this, dbHelpers);

        this.db = this.initDB();
    }

    _createClass(dbHelpers, [{
        key: 'initDB',
        value: function initDB() {
            var db = new _sqlite2.default.Database('./../sensordata.db', function (err) {
                if (err) {
                    console.log('error connecting to sqlite:', err);
                }
            });
            return db;
        }
    }, {
        key: 'closeDB',
        value: function closeDB() {
            var _this = this;

            return new new Promise(function (resolve, reject) {
                _this.db.close(function (err) {
                    if (err) {
                        reject('Error closing database connection: ' + err);
                    } else {
                        resolve();
                    }
                });
            })();
        }
    }, {
        key: 'initTables',
        value: function initTables() {
            var _this2 = this;

            this.db.serialize(function () {
                //this.db.run(`DROP TABLE IF EXISTS temperature_readings`)
                //this.db.run(`DROP TABLE IF EXISTS bloodpressure_readings`)
                //this.db.run(`DROP TABLE IF EXISTS glucose_readings`)
                //this.db.run(`DROP TABLE IF EXISTS oxygen_readings`)
                //this.db.run(`DROP TABLE IF EXISTS weight_readings`)
                //console.log('deleted all tables');
                console.log('creating all tables');
                _this2.db.run('CREATE TABLE IF NOT EXISTS temperature_readings\n                    (temperature REAL,collect_time DATETIME);');
                _this2.db.run('CREATE TABLE IF NOT EXISTS bloodpressure_readings\n                    (diastolic REAL, pulse REAL, systolic REAL,\n                    collect_time DATETIME);');
                _this2.db.run('CREATE TABLE IF NOT EXISTS glucose_readings\n                    (mg_dl REAL,mmol_l REAL,\n                    collect_time DATETIME);');
                _this2.db.run('CREATE TABLE IF NOT EXISTS oxygen_readings\n                    (pulse REAL,spo2 REAL,\n                    collect_time DATETIME);');
                _this2.db.run('CREATE TABLE IF NOT EXISTS weight_readings\n                    (bmi REAL,bodyfat REAL,weight REAL,\n                    collect_time DATETIME);');
            });
            console.log('created all tables');
            /*var stmt = this.db.prepare("INSERT INTO temperature_readings VALUES (?,?)");
            for (var i = 0; i < 10; i++) {
                stmt.run(25+i,Math.trunc(Date.now()/1000));
            }
            stmt.finalize();*/
        }
    }, {
        key: 'insertTemp',
        value: function insertTemp(data) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                _this3.db.serialize(function () {
                    var temp = _this3.db.prepare("INSERT INTO temperature_readings VALUES (?,?)");
                    temp.run(data.temperature, data.collect_time);
                    temp.finalize(function (err) {
                        if (err) reject('Error: ' + err);else resolve("success !");
                    });
                });
            });
        }
    }, {
        key: 'insertOxy',
        value: function insertOxy(data) {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                _this4.db.serialize(function () {
                    var oxy = _this4.db.prepare("INSERT INTO oxygen_readings VALUES (?,?,?)");
                    oxy.run(data.pulse, data.spo2, data.collect_time);
                    oxy.finalize(function (err) {
                        if (err) reject('Error: ' + err);else resolve();
                    });
                });
            });
        }
    }, {
        key: 'insertGluc',
        value: function insertGluc(data) {
            var _this5 = this;

            return new Promise(function (resolve, reject) {
                _this5.db.serialize(function () {
                    var gluc = _this5.db.prepare("INSERT INTO glucose_readings VALUES (?,?,?)");
                    gluc.run(data.mg_dl, data.mmol_l, data.collect_time);
                    gluc.finalize(function (err) {
                        if (err) reject('Error: ' + err);else resolve();
                    });
                });
            });
        }
    }, {
        key: 'insertBP',
        value: function insertBP(data) {
            var _this6 = this;

            return new Promise(function (resolve, reject) {
                _this6.db.serialize(function () {
                    var bp = _this6.db.prepare("INSERT INTO bloodpressure_readings VALUES (?,?,?,?)");
                    bp.run(data.diastolic, data.pulse, data.systolic, data.collect_time);
                    bp.finalize(function (err) {
                        if (err) reject('Error: ' + err);else resolve();
                    });
                });
            });
        }
    }, {
        key: 'insertWeight',
        value: function insertWeight(data) {
            var _this7 = this;

            return new Promise(function (resolve, reject) {
                _this7.db.serialize(function () {
                    var weight = _this7.db.prepare("INSERT INTO weight_readings VALUES (?,?,?,?)");
                    weight.run(data.bmi, data.bodyfat, data.weight, data.collect_time);
                    weight.finalize(function (err) {
                        if (err) reject('Error: ' + err);else resolve();
                    });
                });
            });
        }
    }, {
        key: 'fetchFromDB',
        value: function fetchFromDB() {
            var _this8 = this;

            return new Promise(function (resolve, reject) {

                _this8.db.serialize(function () {
                    var temps = new Array();
                    var oxy = new Array();
                    var gluc = new Array();
                    var bp = new Array();
                    var weight = new Array();
                    var response = new Array();

                    _this8.db.each("SELECT * FROM temperature_readings ORDER BY collect_time ASC ;", function (err, row) {
                        if (err) {
                            reject('Error querying temp:' + err);
                        }
                        temps.push(row);
                    }, function () {
                        response['temperature'] = temps;
                    });
                    _this8.db.each("SELECT * FROM glucose_readings ORDER BY collect_time ASC ;", function (err, row) {
                        if (err) {
                            reject('Error querying glucose:' + err);
                        }
                        gluc.push(row);
                    }, function () {
                        response['glucose'] = gluc;
                    });
                    _this8.db.each("SELECT * FROM oxygen_readings ORDER BY collect_time ASC ;", function (err, row) {
                        if (err) {
                            reject('Error querying oxygen: ' + err);
                        }
                        oxy.push(row);
                    }, function () {
                        response['oxygen'] = oxy;
                    });
                    _this8.db.each("SELECT * FROM bloodpressure_readings ORDER BY collect_time ASC ;", function (err, row) {
                        if (err) {
                            reject('Error querying bp: ' + err);
                        }
                        bp.push(row);
                    }, function () {
                        response['bp'] = bp;
                    });

                    _this8.db.each("SELECT * FROM weight_readings ORDER BY collect_time ASC ;", function (err, row) {
                        if (err) {
                            reject('Error querying weight: ' + err);
                        }
                        weight.push(row);
                    }, function () {
                        response['weight'] = weight;
                        resolve(response);
                    });
                });
            });
        }
    }, {
        key: 'DeleteAll',
        value: function DeleteAll() {
            var _this9 = this;

            return new Promise(function (resolve, reject) {
                _this9.db.serialize(function () {
                    _this9.db.run('DELETE FROM temperature_readings;', function (err) {
                        if (err) {
                            reject("Error deleting records: " + err);
                        }
                    });
                    _this9.db.run('DELETE FROM glucose_readings;', function (err) {
                        if (err) {
                            reject("Error deleting records: " + err);
                        }
                    });
                    _this9.db.run('DELETE FROM bloodpressure_readings;', function (err) {
                        if (err) {
                            reject("Error deleting records: " + err);
                        }
                    });
                    _this9.db.run('DELETE FROM oxygen_readings;', function (err) {
                        if (err) {
                            reject("Error deleting records: " + err);
                        }
                    });
                    _this9.db.run('DELETE FROM weight_readings;', function (err) {
                        if (err) {
                            reject("Error deleting records: " + err);
                        }
                    });
                    resolve();
                });
            });
        }
    }]);

    return dbHelpers;
}();
//# sourceMappingURL=dbHelpers.js.map