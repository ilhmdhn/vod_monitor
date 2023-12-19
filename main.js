const { app, BrowserWindow, Tray, ipcMain } = require('electron');
const {setPreferences, getPreferences} = require('./src/configuration');
const startUpload = require('./src/timer-upload');

const createWindow = async() =>{
    const additionalData = { myKey: 'VOD_MONITOR' }
    const gotTheLock = app.requestSingleInstanceLock(additionalData);

    if (!gotTheLock) {
        win == null;
        app.isQuiting = true;
        app.quit();
        win.close();
        app.exit();
        return;
    }

    const win = new BrowserWindow({
        width: 544,
        height: 540,
        // show: true,
        icon: './icon.png',
        title: "Self Checkin Server",
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        enableRemoteModule: true
    });

    win.loadFile('./page/index.html');
    
    win.on('closed', (event) => {
        event.preventDefault();
        win.hide();
    })

    win.on('minimize', (event) => {
        event.preventDefault();
        win.hide();
    });

    win.on('close', (event) => {
        event.preventDefault();
        win.hide();
    });

    startUpload()

    win.webContents.on('did-finish-load', ()=>{
        showConfig()
    });

    ipcMain.on('SEND-CONFIG', async(event, data)=>{
        setPreferences({
            serverIp: data.ipAddress,
            outletCode: data.outletCode
        });
        win.webContents.send('SHOW-SETTING', {
            ip: '',
            outlet: ''
        });
        await sleep(1000);
        showConfig()
    });

    const showConfig = () =>{
        const dataSetting = getPreferences();
        win.webContents.send('SHOW-SETTING', {
            ip: dataSetting.serverIp,
            outlet: dataSetting.outletCode
        });
    }

    const  sleep = (ms)=> {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      }
}

app.whenReady().then(()=>{
    createWindow();
})