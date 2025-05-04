const { contextBridge, ipcRenderer } = require('electron');

// Безопасное предоставление API в рендер-процесс
contextBridge.exposeInMainWorld('electronAPI', {
    windowControl: {
        minimize: () => ipcRenderer.send('window:minimize'),
        maximize: () => ipcRenderer.send('window:maximize'),
        close: () => ipcRenderer.send('window:close')
    },
    shell: {
        openPath: (path) => ipcRenderer.invoke('shell:openPath', path)
    },
    disableAutofill: () => {
        try {
            document.querySelectorAll('input').forEach(input => {
                input.autocomplete = 'off';
                input.autocorrect = 'off';
                input.autocapitalize = 'off';
                input.spellcheck = false;
            });
        } catch (error) {
            console.error('Autofill disable error:', error);
        }
    },
    onWindowFocus: (callback) => ipcRenderer.on('window-focus', callback),
    onWindowBlur: (callback) => ipcRenderer.on('window-blur', callback)
});

// Защита от переопределения
contextBridge.exposeInMainWorld('isElectron', true);