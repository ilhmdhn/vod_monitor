const {getPreferences} = require('./configuration');

module.exports = setInterval(async()=>{
    const configuration = getPreferences()
    if(!configuration.outletCode || !configuration.serverIp){
        console.log('return')
        return;
    }

    await prosesUpload()
}, 1000);