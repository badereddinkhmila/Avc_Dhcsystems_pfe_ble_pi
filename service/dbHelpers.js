import sqlite3 from 'sqlite3';


export class dbHelpers{
    
    constructor(){
        this.db = this.initDB();
    }

    initDB() {
        const db = new sqlite3.Database('./../sensordata.db',(err)=>{
        if(err){
            console.log('error connecting to sqlite:',err)
        }
        });
        return db;
    }

    closeDB(){
        return new new Promise((resolve, reject) => { 
            this.db.close(err=>{
            if(err) {
                reject('Error closing database connection: '+err)
            } else {
                resolve()
            }});
        })
    }

    initTables(){
        this.db.serialize(() => {
            //this.db.run(`DROP TABLE IF EXISTS temperature_readings`)
            //this.db.run(`DROP TABLE IF EXISTS bloodpressure_readings`)
            //this.db.run(`DROP TABLE IF EXISTS glucose_readings`)
            //this.db.run(`DROP TABLE IF EXISTS oxygen_readings`)
            //this.db.run(`DROP TABLE IF EXISTS weight_readings`)
            //console.log('deleted all tables');
            console.log('creating all tables');
            this.db.run(`CREATE TABLE IF NOT EXISTS temperature_readings
                    (temperature REAL,collect_time DATETIME);`);
            this.db.run(`CREATE TABLE IF NOT EXISTS bloodpressure_readings
                    (diastolic REAL, pulse REAL, systolic REAL,
                    collect_time DATETIME);`);
            this.db.run(`CREATE TABLE IF NOT EXISTS glucose_readings
                    (mg_dl REAL,mmol_l REAL,
                    collect_time DATETIME);`);
            this.db.run(`CREATE TABLE IF NOT EXISTS oxygen_readings
                    (pulse REAL,spo2 REAL,
                    collect_time DATETIME);`);
            this.db.run(`CREATE TABLE IF NOT EXISTS weight_readings
                    (bmi REAL,bodyfat REAL,weight REAL,
                    collect_time DATETIME);`);        
          });
          console.log('created all tables');
          /*var stmt = this.db.prepare("INSERT INTO temperature_readings VALUES (?,?)");
          for (var i = 0; i < 10; i++) {
              stmt.run(25+i,Math.trunc(Date.now()/1000));
          }
          stmt.finalize();*/   
    }

    insertTemp(data){
        return new Promise((resolve,reject)=>{
            this.db.serialize(() => {
            const temp = this.db.prepare("INSERT INTO temperature_readings VALUES (?,?)");
            temp.run(data.temperature,data.collect_time);
            temp.finalize((err)=>{
                if(err) reject('Error: ' + err)
                else resolve("success !")
            });
            });
        })      
    }
    
    insertOxy(data){
        return new Promise((resolve,reject)=>{
            this.db.serialize(() => {
            const oxy = this.db.prepare("INSERT INTO oxygen_readings VALUES (?,?,?)");
            oxy.run(data.pulse,data.spo2,data.collect_time);
            oxy.finalize((err)=>{
                if(err) reject('Error: ' + err)
                else resolve()
            });
            });
        })      
    }
    
    insertGluc(data){
        return new Promise((resolve,reject)=>{
            this.db.serialize(() => {
            const gluc = this.db.prepare("INSERT INTO glucose_readings VALUES (?,?,?)");
            gluc.run(data.mg_dl,data.mmol_l,data.collect_time);
            gluc.finalize((err)=>{
                if(err) reject('Error: ' + err)
                else resolve()
            });
            });
        })      
    }
    

    insertBP(data){
        return new Promise((resolve,reject)=>{
            this.db.serialize(() => {
            const bp = this.db.prepare("INSERT INTO bloodpressure_readings VALUES (?,?,?,?)");
            bp.run(data.diastolic,data.pulse,data.systolic,data.collect_time);
            bp.finalize((err)=>{
                if(err) reject('Error: ' + err)
                else resolve()
            });
            });
        })      
    }
    
    insertWeight(data){
        return new Promise((resolve,reject)=>{
            this.db.serialize(() => {
            const weight = this.db.prepare("INSERT INTO weight_readings VALUES (?,?,?,?)");
            weight.run(data.bmi,data.bodyfat,data.weight,data.collect_time);
            weight.finalize((err)=>{
                if(err) reject('Error: ' + err)
                else resolve()
            });
            });
        })      
    }
    
    fetchFromDB(){
        return new Promise((resolve,reject)=>{
                
                this.db.serialize(()=>{
                    let temps=new Array();
                    let oxy=new Array();
                    let gluc=new Array();
                    let bp=new Array();
                    let weight=new Array();
                    let response=new Array();
                    
                    this.db.each("SELECT * FROM temperature_readings ORDER BY collect_time ASC ;",function(err, row) {
                        if(err){
                            reject('Error querying temp:'+err);
                        }
                        temps.push(row)
                    },()=>{
                        response['temperature']=temps;
                    });
                    this.db.each("SELECT * FROM glucose_readings ORDER BY collect_time ASC ;",function(err, row) {
                        if(err){
                            reject('Error querying glucose:'+err);
                        }
                        gluc.push(row)
                    },()=>{
                        response['glucose']=gluc;
                    });
                    this.db.each("SELECT * FROM oxygen_readings ORDER BY collect_time ASC ;",function(err, row) {
                        if(err){
                            reject('Error querying oxygen: '+err);
                        }
                        oxy.push(row)
                    },()=>{
                        response['oxygen']=oxy;
                    });
                    this.db.each("SELECT * FROM bloodpressure_readings ORDER BY collect_time ASC ;",function(err, row) {
                        if(err){
                            reject('Error querying bp: '+err);
                        }
                        bp.push(row)
                    },()=>{
                        response['bp']=bp;
                    });

                    this.db.each("SELECT * FROM weight_readings ORDER BY collect_time ASC ;",function(err, row) {
                        if(err){
                            reject('Error querying weight: '+err);
                        }
                        weight.push(row)
                    },()=>{
                        response['weight']=weight;            
                        resolve(response);
                    });
                });    
        })       
    }

    DeleteAll(){
        return new Promise((resolve, reject) => {
          this.db.serialize(()=>{
              this.db.run(`DELETE FROM temperature_readings;`,err => {
                    if(err){
                        reject("Error deleting records: "+err);
                    }
              })
              this.db.run(`DELETE FROM glucose_readings;`,err => {
                        if(err){
                            reject("Error deleting records: "+err);
                        }
              })
              this.db.run(`DELETE FROM bloodpressure_readings;`,err => {
                    if(err){
                    reject("Error deleting records: "+err);
                }
              })
              this.db.run(`DELETE FROM oxygen_readings;`,err => {
                    if(err){
                        reject("Error deleting records: "+err);
                    }
              })
              this.db.run(`DELETE FROM weight_readings;`,err => {
                if(err){
                    reject("Error deleting records: "+err);
                }
              })
              resolve();
          })
        })
    }
}




    
