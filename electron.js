const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 600,
        minHeight: 800,
        minWidth: 1200,
        frame: false,  // Убираем стандартную рамку окна
        webPreferences: {
            nodeIntegration: false,  // Отключаем nodeIntegration для безопасности
            contextIsolation: true,  // Включаем contextIsolation
            preload: path.join(__dirname, 'preload.js'),
            contentSecurityPolicy: `
                default-src 'self';
                script-src 'self';
                style-src 'self' 'unsafe-inline';
                img-src 'self' data:;
                connect-src 'self';
                font-src 'self';
                frame-src 'none';
                object-src 'none';
            `.replace(/\s+/g, ' ') 
        },
    });

    // Загружаем React-приложение
    mainWindow.loadURL('http://localhost:3000');

    // Открываем DevTools для отладки (опционально)
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// Обработчики для управления окном
// Замените старые обработчики на эти:
ipcMain.on('window-control:minimize', () => {
    mainWindow.minimize();
});

ipcMain.on('window-control:maximize', () => {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});

ipcMain.on('window-control:close', () => {
    mainWindow.close();
});
// main.js
app.on('ready', () => {
    // Отключаем нежелательные функции Chromium
    app.commandLine.appendSwitch('disable-http-cache');
    app.commandLine.appendSwitch('disable-background-timer-throttling');
    app.commandLine.appendSwitch('disable-renderer-backgrounding');
    
    // Устанавливаем более стабильные параметры для сетевых запросов
    // session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    // details.requestHeaders['Connection'] = 'keep-alive';
    // callback({ cancel: false, requestHeaders: details.requestHeaders });
});
// });