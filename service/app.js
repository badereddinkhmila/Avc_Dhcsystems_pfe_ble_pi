import noble from 'noble';
import { dbHelpers } from './dbHelpers';
import { mqttHelpers } from './mqttHelpers';

const clientId = 'Yassine_Gateway_RBP_3B+';
const connectUrl = 'tcp://192.168.1.232:1883/mqtt';
//const connectUrl = 'tcp://192.168.1.13:1883/mqtt'


const dbhelper = new dbHelpers();
dbhelper.initTables();

const mqtthelper=new mqttHelpers(clientId,connectUrl);

mqtthelper.broker.on("connect", function () {
    mqtthelper.checkDB()
});

mqtthelper.broker.on("reconnect", function () {
    console.log('reconnecting to mqtt...')
});

noble.on('stateChange', (state) => {
    if (state === 'poweredOn') {
        console.log('Powered On');
        noble.startScanning([], true);
    }
});

noble.on('scanStart', () => {
    console.log('scan start');
})

noble.on('scanStop', () => {
    console.log('scan stopped');
})

let devices=[]

noble.on('discover', (device) => {
    let localName = device.advertisement.localName;
    console.log(device.advertisement.serviceData,device.advertisement.serviceUuids)
    console.log(devices.indexOf(device.advertisement.localName))
    console.log('discovered: ', device.address);
    if (localName !== undefined && localName !== ""){
        device.on('connect',()=>{
            console.log('connected to',device.address)
            devices.push(device.address)
            device.discoverAllServicesAndCharacteristics((error,services,characteristics)=>{
                services.forEach((service,chId)=>{
                    console.log('Uuid:'+service.uuid)    
                })
                let heart=null;
                let temp=null;
                let bp = null;
                characteristics.forEach((ch,chId)=>{
                    console.log('Uuid:'+ch.uuid,'Name:'+ch.name,'Properties:'+ch.properties)
                    if(ch.name!==null && ch.name.includes("Heart Rate Meas")){
                        //heart=ch  
                    }
                    if(ch.name!==null && ch.name.includes("Temperature Measurement")){
                        console.log('subscribed to temperature service');
                        temp=ch  
                    }
                    
                    if(ch.name!==null && ch.name.includes("Blood Pressure Measurement")){
                        console.log('subscribed to blood pressure service');
                        bp=ch
                    }
                })
                if(heart !== null ){
                console.log('type: ',heart.name)
                heart.subscribe((error)=>{
                    console.log('in subs')
                    if(error){console.log('my error: ',error)}
                })
                heart.on('data',(data,isNotification)=>{
                    //let mydata=Buffer.from(data)
                    console.log((data.toJSON())['data']) 
                })
                }
                if(bp !== null ){
                bp.subscribe((error)=>{
                    console.log('in subs')
                    if(error){console.log('my error: ',error)}
                })
                bp.on('data',(data,isNotification)=>{
                    console.log(data)
                    let my_data=(data.toJSON())['data']
                    let time=Math.trunc(Date.now()/1000)
                    let msg = {'diastolic': my_data[1],'pulse': my_data[14],
                        'systolic': my_data[3],'collect_time': time};
                    if(mqtthelper.broker.connected)
                    {
                        console.log('Sendig through the broker');
                        mqtthelper.sendBP(msg)
                    }
                    else{
                        console.log('Falling to sqlite3 local storage')
                        dbhelper.insertBP(msg)
                        .then(resp=>{console.log(resp);})
                    } 
                })
                }
                if(temp !== null ){
                    console.log('type: ',temp.name)
                    temp.subscribe((error)=>{
                        if(error){console.log('my error:',error)}
                    })
                    temp.on('data',(data,isNotification)=>{
                        let value=(data.toJSON())['data'].toFixed(2)
                        let time=Math.trunc(Date.now()/1000)
                        let msg={'temperature':value,'collect_time':time};
                        if(mqtthelper.broker.connected)
                        {
                            console.log('Sendig through the broker');
                            mqtthelper.sendTemperature(msg)
                        }
                        else{
                            console.log('Falling to sqlite3 local storage')
                            dbhelper.insertTemp(msg)
                            .then(resp=>{console.log(resp);})
                        }
                        })
                    }
            })
        })

        if(devices.indexOf(device.address) == -1 ){
            device.connect((error)=>{
                if (error) {
                    console.log(error)
                }
            console.log(device.address,'connected!!')
            noble.startScanning();
        })
        device.on('disconnect',(error)=>{
            if(error) console.log(error);
                devices.pop(device.address)
        })
    }
    }
})
