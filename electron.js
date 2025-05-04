const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

// Конфигурация приложения
app.name = 'MyElectronApp';
app.allowRendererProcessReuse = true;

let mainWindow;

function createWindow() {
    // Настройки сессии для отключения проблемных функций
    configureSession();

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1000,
        minHeight: 700,
        frame: false,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            webSecurity: true,
            preload: path.join(__dirname, 'preload.js'),
            disableBlinkFeatures: 'AutofillAPI',
            autoplayPolicy: 'user-gesture-required'
        }
    });

    // Загрузка приложения
    mainWindow.loadURL(
        process.env.NODE_ENV === 'development'
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`
    );

    // Оптимизация производительности
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (process.env.NODE_ENV === 'development') {
            mainWindow.webContents.openDevTools({ mode: 'detach' });
        }
    });

    // Обработчики событий окна
    mainWindow.on('closed', () => (mainWindow = null));
    mainWindow.on('focus', () => mainWindow.webContents.send('window-focus'));
    mainWindow.on('blur', () => mainWindow.webContents.send('window-blur'));

    // Настройка веб-запросов
    setupRequestHandlers();
}

function configureSession() {
    try {
        const mainSession = session.defaultSession;
        
        // Отключаем проблемные функции
        app.commandLine.appendSwitch('disable-http-cache');
        app.commandLine.appendSwitch('disable-background-timer-throttling');
        app.commandLine.appendSwitch('disable-renderer-backgrounding');
        app.commandLine.appendSwitch('disable-features', 'AutofillServerCommunication,TranslateUI');
        
        // Очистка кэша при запуске
        mainSession.clearCache().catch(console.error);
        mainSession.clearStorageData().catch(console.error);
    } catch (error) {
        console.error('Session configuration failed:', error);
    }
}

function setupRequestHandlers() {
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        const newHeaders = {
            ...details.requestHeaders,
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br'
        };
        callback({ requestHeaders: newHeaders });
    });

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        const newHeaders = {
            ...details.responseHeaders,
            'Content-Security-Policy': [
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data:; " +
                "connect-src 'self' http://localhost:5000; " +
                "font-src 'self'; " +
                "frame-src 'none'; " +
                "media-src 'self'; " +
                "object-src 'none';"
            ]
        };
        callback({ responseHeaders: newHeaders });
    });
}

// Обработчики IPC для управления окном
ipcMain.handle('window:minimize', () => mainWindow?.minimize());
ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow?.maximize();
    }
});
ipcMain.handle('window:close', () => mainWindow?.close());

// События жизненного цикла приложения
app.whenReady().then(() => {
    createWindow();
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Обработка ошибок в главном процессе
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});