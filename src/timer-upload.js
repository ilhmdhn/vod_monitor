const {getPreferences} = require('./configuration');
const {cekFiles} = require('./read_file');
const config = require('./config');
const axios = require('axios');

let isProcess = false;

const executeUpload = async()=>{
    try {
        isProcess = true;
        const configuration = getPreferences()
        if(!configuration.outletCode || !configuration.serverIp){
            return;
        }
        const files = await cekFiles()
        if(files.length<1){
            return;
        }
            
        const body = JSON.stringify({
            outlet: configuration.outletCode,
            version: '1.0.0',
            file: files
        });
    
        const httpOptions= {
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': body.length,
                'authorization': config.auth
            },
        }
        await axios.post(config.url, body,httpOptions)
    
    } catch (err) {
        console.log(JSON.stringify({
            name: err.name,
            message: err.message,
            stack: err.stack,
        }))
    }finally{
        isProcess = false;
    }
};

const startUpload = () =>{
    executeUpload()
    setInterval(()=>{
        if(!isProcess){
            executeUpload()
        }
    }, 5000)
}
//3600000
module.exports = {
    startUpload,
    executeUpload
};