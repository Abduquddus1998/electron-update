const { app, BrowserWindow, ipcMain, dialog} = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
let mainWindow;


autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');


function createWindow () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });
    mainWindow.loadFile('index.html');
    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    log.info('main window created annd checking for update');
    autoUpdater.checkForUpdates();

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('version', app.getVersion())
    })
}

app.on('ready', () => {
    createWindow();
});

function sendStatusToWindow(text) {
    log.info(text);
    mainWindow.webContents.send('message', text);
}

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', (_event, releaseNotes, releaseName) => {
    log.info('update-available listener', releaseNotes, releaseName, _event);
    sendStatusToWindow('Update available. sendStatusToWindow');

    mainWindow.webContents.send('update_available');
    const dialogOpts = {
        type: 'info',
        buttons: ['Ok'],
        title: 'Update Available',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version download started. The app will be restarted to install the update.'
    };
    dialog.showMessageBox(dialogOpts);
});

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
})

autoUpdater.on('update-downloaded', (_event, releaseNotes, releaseName) => {
    log.info('update-downloaded', releaseNotes, releaseName, _event);
    sendStatusToWindow('Update downloaded sendStatusToWindow');

    mainWindow.webContents.send('update_downloaded');
    const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail:
            'A new version has been downloaded. Restart the application to apply the updates.',
    }

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        log.info('update-downloaded showMessageBox', returnValue, releaseNotes, releaseName, _event);
        autoUpdater.quitAndInstall()

        if (returnValue.response === 0) {
            console.log('return value', returnValue);
        }
    })

});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});