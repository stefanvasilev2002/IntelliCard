const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let springProcess;

function startSpringBackend() {
    if (isDev) {
        console.log('Development mode: Assuming Spring backend is running separately');
        return;
    }

    const jarPath = path.join(__dirname, '../backend/intellicard-backend.jar');

    console.log('Starting Spring Boot backend...');
    springProcess = spawn('java', ['-jar', jarPath, '--spring.profiles.active=desktop'], {
        cwd: path.dirname(jarPath),
        stdio: 'pipe'
    });

    springProcess.stdout.on('data', (data) => {
        console.log(`Spring Boot: ${data}`);
    });

    springProcess.stderr.on('data', (data) => {
        console.error(`Spring Boot Error: ${data}`);
    });

    springProcess.on('close', (code) => {
        console.log(`Spring Boot process exited with code ${code}`);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.cjs'),
            webSecurity: true
        },
        icon: path.join(__dirname, '../public/icon.png'),
        show: false,
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
    });

    const loadURL = isDev
        ? 'http://localhost:5173'
        : `file://${path.join(__dirname, '../dist/index.html')}`;

    mainWindow.loadURL(loadURL);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();

        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        require('electron').shell.openExternal(url);
        return { action: 'deny' };
    });
}

app.whenReady().then(() => {
    startSpringBackend();

    setTimeout(createWindow, isDev ? 0 : 5000);
});

app.on('window-all-closed', () => {
    if (springProcess) {
        springProcess.kill();
    }

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('before-quit', () => {
    if (springProcess) {
        springProcess.kill('SIGTERM');
    }
});

ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('is-desktop', () => {
    return true;
});

ipcMain.handle('get-platform', () => {
    return process.platform;
});