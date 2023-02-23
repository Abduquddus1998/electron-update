const { app, BrowserWindow, dialog} = require('electron');
const { autoUpdater } = require('electron-updater');
let mainWindow;


function createWindow () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });
    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates();
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
});

autoUpdater.on("update-available", (_event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Ok'],
        title: 'Update Available',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version download started. The app will be restarted to install the update.'
    };
    dialog.showMessageBox(dialogOpts);
});


autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    autoUpdater.quitAndInstall()

    const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail:
            'A new version has been downloaded. Restart the application to apply the updates.',
    }

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        console.log("returnValue", returnValue)

    })
})

autoUpdater.on("update-not-available", (_event) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Ok'],
        title: `Update Not available for ${autoUpdater.channel}`,
        message: "A message!",
        detail: `Update Not available for ${autoUpdater.channel}`
    };

    dialog.showMessageBox(dialogOpts);
});

