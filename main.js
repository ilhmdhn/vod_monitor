const { app, BrowserWindow, Tray, ipcMain, Menu } = require('electron');
const {setPreferences, getPreferences} = require('./src/configuration');
const startUpload = require('./src/timer-upload');
const path = require('path')

const createWindow = async() =>{
    const additionalData = { myKey: 'VOD_MONITOR' }
    const gotTheLock = app.requestSingleInstanceLock(additionalData);

    const win = new BrowserWindow({
        width: 544,
        height: 540,
        show: true,
        icon: path.join(__dirname, '/page/music.png'),
        title: "Song Optimizer",
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        enableRemoteModule: true
    });

    if (!gotTheLock) {
        win == null;
        app.isQuiting = true;
        app.quit();
        win.close();
        app.exit();
        return;
    }

    win.loadFile('./page/index.html');
    win.focus();
    win.center();
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

    const iconTray = path.join(__dirname, '/page/music.png');
    const tray = new Tray(iconTray);
    tray.on('click', () => {
        if (win.isVisible()) {
            win.hide();
        } else {
            win.show();
        }
    });
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show',
            click: () => {
                if (win.isVisible()) {
                    win.hide();
                } else {
                    win.show();
                }
            }
        },
        {
            label: 'Quit',
            click: () => {
                app.isQuiting = true;
                app.quit();
                win.close();
                app.exit();
                return
            }
        }
    ]);

    tray.setTitle("Song Optimizer");
    tray.setContextMenu(contextMenu);
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