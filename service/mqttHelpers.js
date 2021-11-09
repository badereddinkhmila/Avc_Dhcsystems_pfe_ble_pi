import mqtt from 'mqtt' ;
import { dbHelpers } from './dbHelpers'; 

export class mqttHelpers{
    
    constructor(clientId,Url){
        this.clientId=clientId;
        this.Url=Url;
        this.broker = this.initBroker();
    }

    initBroker() {
        const mqtt_options = {
            keepalive: 3600,
            clientId: this.clientId,
            clean: true,
            reconnectPeriod: 1000,
            connectTimeout: 30 * 1000,
        }     
        try{    
            const client = mqtt.connect(this.Url, mqtt_options)
            console.log('mqtt broker connection state',client.connected);
            return client;
        }catch(e){
            console.log('unable to connect')
        }
    }

    checkDB() {
        const db = new dbHelpers();
        db.fetchFromDB().then( data =>{
            if ( data.length == 0) {
                console.log("local database is empty")
            }

            const temp_len=data.temperature.length
            const glu_len=data.glucose.length
            const bp_len=data.bp.length
            const oxy_len=data.oxygen
            const weight_len=data.weight.length

            if(temp_len !==0){ 
                for(let i=0; i< temp_len ;i++){
                    this.sendTemperature((data.temperature)[i])
                    console.log((data.temperature)[i])
                }
            }

            else if(glu_len !==0){
                for(let i=0; i< glu_len ;i++){
                    this.sendGlucose((data.glucose)[i])
                }
            }

            else if( oxy_len !==0 ){
                for(let i=0; i< oxy_len ;i++){
                    this.sendOxygen((data.oxygen)[i])
                }
            }
            else if(bp_len !==0) {
                for(let i=0; i< bp_len ;i++){
                    this.sendBP((data.bp)[i])
                }
            }

            else if(weight_len !==0){
                for(let i=0; i< weight_len ;i++){
                    this.sendWeight((data.weight)[i])
                }
            }
            db.DeleteAll()
        })
    }


    sendTemperature(data){
        return new Promise((resolve,reject)=>{
            try{  let msg={'gateway_id':this.clientId,'collect_time':data.collect_time,'temperature':data.temperature}
                    console.log(msg);
                try{
                    this.broker.publish('avc/temperature',JSON.stringify(msg))
                    console.log('successfully sent temperature message');
                    resolve()
                }catch(e){
                    reject(e);
                }
            }catch(e){
                reject(e);
            }
        })
    }

    sendGlucose(data){
        return new Promise((resolve,reject)=>{
            try{  let  msg={'gateway_id':this.clientId,'collect_time':data.collect_time,
                    'mg_dl':data.mg_dl,'mmol_l':data.mmol_l}
                try{
                    this.broker.publish('avc/glucose', JSON.stringify(msg))
                    resolve()
                }catch(e){
                    reject(e);
                }
            }catch(e){
                reject(e);
            }
        })
    }

    sendOxygen(data){
        return new Promise((resolve,reject)=>{
            try{  let  msg={'gateway_id':this.clientId,'collect_time':data.collect_time,
                    'pulse':data.pulse,'spo2':data.spo2}
                try{
                    this.broker.publish('avc/oxygen',JSON.stringify(msg))
                    resolve()
                }catch(e){
                    reject(e);
                }
            }catch(e){
                reject(e);
            }
        })
    }
    
    sendBP(data){
        return new Promise((resolve,reject)=>{
            try{    let msg={'gateway_id':this.clientId,'collect_time':data.collect_time,'diastolic':data.diastolic,'pulse':data.pulse,'systolic':data.systolic}
                try{
                    this.broker.publish('avc/blood_pressure',JSON.stringify(msg))
                    console.log(msg)
                    resolve()
                }catch(e){
                    reject(e);
                }
            }catch(e){
                reject(e);
            }
        })
    }

    sendWeight(data){
        return new Promise((resolve,reject)=>{
            try{let msg={'gateway_id':this.clientId,'collect_time':data.collect_time,
                    'bmi':data.bmi,'bodyfat':data.bodyfat,'weight':data.weight}
                try{
                    this.broker.publish('avc/weight',JSON.stringify(msg))
                    resolve()
                }catch(e){
                    reject(e);
                }
            }catch(e){
                reject(e);
            }
        })
    }
}
