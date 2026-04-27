const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindows() {
    // 1. Create the Splash Screen (Loading)
    const splash = new BrowserWindow({
        width: 800,
        height: 600,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        icon: path.join(__dirname, 'assets/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    splash.loadFile('splash.html');

    // 2. Create the Main Window (Hidden for now)
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        title: "ASTRO",
        show: false,
        icon: path.join(__dirname, 'assets/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');

    // When main window is ready, wait 3 seconds (for splash effect) then swap
    mainWindow.once('ready-to-show', () => {
        setTimeout(() => {
            splash.close();
            mainWindow.maximize();
            mainWindow.show();
        }, 3500); // 3.5 seconds of splash
    });
}

app.whenReady().then(createWindows);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
