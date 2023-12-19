const {getPreferences} = require('./configuration');
const getFiles = require('./read_file');
const config = require('./config');
const axios = require('axios');

let isProcess = false;

const executeUpload = async()=>{
    if(isProcess){
        return;
    }
    isProcess = true;

    try {
        const configuration = getPreferences()
        if(!configuration.outletCode || !configuration.serverIp){
            console.log('return')
            return;
        }
        const files = await getFiles()
        
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
            const httpResponse = await axios.post(config.url, body,httpOptions)
    
            console.log(httpResponse.data)
        } catch (err) {
            console.log(err);
        }
    isProcess = false;
};

const startUpload = () =>{
    executeUpload()
    setInterval(()=>{
        if(!isProcess){
            executeUpload()
        }
    }, 10000)
}

module.exports = startUpload;