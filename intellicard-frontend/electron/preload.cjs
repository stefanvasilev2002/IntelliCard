const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    isDesktop: () => ipcRenderer.invoke('is-desktop'),
    getPlatform: () => ipcRenderer.invoke('get-platform'),
});