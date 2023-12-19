const Store = require('electron-store');

const setPreferences = (settingsData) =>{
    const store = new Store();
    store.set('IP_SERVER', settingsData.serverIp),
    store.set('OUTLET', settingsData.outletCode)
}

const getPreferences = () =>{
    const store = new Store();
    return {
        serverIp: store.get('IP_SERVER'),
        outletCode: store.get('OUTLET')
    }
}

module.exports = {
    setPreferences,
    getPreferences
}