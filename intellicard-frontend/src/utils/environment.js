export const isElectron = () => {
    return typeof window !== 'undefined' && window.electronAPI;
};

export const isOnline = () => {
    return navigator.onLine;
};

export const getPlatform = async () => {
    if (!isElectron()) return 'web';
    return await window.electronAPI.getPlatform();
};

export const getAppVersion = async () => {
    if (!isElectron()) return '1.0.0-web';
    return await window.electronAPI.getAppVersion();
};

export const getStorageItem = (key) => {
    const item = localStorage.getItem(key);
    try {
        return item ? JSON.parse(item) : null;
    } catch {
        return item;
    }
};

export const setStorageItem = (key, value) => {
    try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch (error) {
        console.warn('Failed to set storage item:', error);
    }
};

export const removeStorageItem = (key) => {
    localStorage.removeItem(key);
};

export const setupNetworkMonitoring = (onOnline, onOffline) => {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
        window.removeEventListener('online', onOnline);
        window.removeEventListener('offline', onOffline);
    };
};

export const getFeatureFlags = () => {
    const electron = isElectron();
    const online = isOnline();

    return {
        aiGeneration: online,
        googleDrive: online,

        offlineMode: electron,
        localBackend: electron,

        desktopNotifications: electron,
        autoUpdater: electron,
        fileSystemAccess: electron,

        manualCardCreation: true,
        studyMode: true,
        cardSets: true,
        userAuth: true
    };
};