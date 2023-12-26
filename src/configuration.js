const Store = require('electron-store');

const setOutlet = (outletCode) =>{
    const store = new Store();
    store.set('OUTLET', outletCode)
}

const setServer = (serverIp)=>{
    const store = new Store();

    store.set('IP_SERVER', serverIp)
}

const getPreferences = () =>{
    const store = new Store();
    return {
        serverIp: store.get('IP_SERVER'),
        outletCode: store.get('OUTLET')
    }
}

module.exports = {
    setOutlet,
    setServer,
    getPreferences
}