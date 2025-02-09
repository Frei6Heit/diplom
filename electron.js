const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,  // Убираем стандартную рамку окна
        webPreferences: {
            nodeIntegration: false,  // Отключаем nodeIntegration для безопасности
            contextIsolation: true,  // Включаем contextIsolation
            preload: path.join(__dirname, 'preload.js'),  // Указываем путь к preload.js
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
ipcMain.on('minimize', () => {
    mainWindow.minimize();
});

ipcMain.on('maximize', () => {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});

ipcMain.on('close', () => {
    mainWindow.close();
});