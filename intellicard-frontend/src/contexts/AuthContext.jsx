import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { authAPI } from '../services/api';
import { isElectron, getStorageItem, setStorageItem, removeStorageItem } from '../utils/environment';
import toast from 'react-hot-toast';
import { syncService } from '../services/SyncService.js';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        const initializeAuth = async () => {

            try {
                const savedUser = await getStorageItem('user');

                if (isElectron()) {
                    if (savedUser) {
                        let userData;

                        if (typeof savedUser === 'string' && savedUser.startsWith('eyJ')) {
                            await removeStorageItem('user');
                        } else {
                            userData = typeof savedUser === 'string' ? JSON.parse(savedUser) : savedUser;
                            setUser(userData);
                            setIsAuthenticated(true);
                        }
                    } else {
                    }
                } else {
                    const token = await getStorageItem('token');
                    if (token && savedUser) {
                        const userData = typeof savedUser === 'string' ? JSON.parse(savedUser) : savedUser;
                        setUser(userData);
                        setIsAuthenticated(true);
                    } else {
                    }
                }
            } catch (error) {
                if (!isElectron()) {
                    await removeStorageItem('token');
                }
                await removeStorageItem('user');
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (credentials, skipCloudSync = false) => {
        try {
            const response = await authAPI.login(credentials);

            if (isElectron()) {
                const userData = {
                    username: credentials.username,
                };

                setStorageItem('user', userData);
                setUser(userData);
                setIsAuthenticated(true);

                return { success: true };
            } else {
                const token = response.data;

                setStorageItem('token', token);

                const userData = {
                    username: credentials.username,
                };

                setStorageItem('user', userData);
                setUser(userData);
                setIsAuthenticated(true);

                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data || error.message || 'Login failed';
            return { success: false, error: message };
        }
    };

    const register = async (userData) => {
        try {
            await authAPI.register(userData);

            if (isElectron()) {
                toast.success('Registration successful! You can now log in.');
            } else {
                toast.success('Registration successful! Please log in.');
            }

            return { success: true };
        } catch (error) {
            const message = error.response?.data || error.message || 'Registration failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            if (!isElectron()) {
                await authAPI.logout();
            }
        } catch (error) {
        }

        if (!isElectron()) {
            removeStorageItem('token');
        }
        removeStorageItem('user');
        setUser(null);
        setIsAuthenticated(false);
        toast.success('Logged out successfully');
    };

    const checkUsername = async (username) => {
        try {
            const response = await authAPI.checkUsername(username);
            return response.data;
        } catch (error) {
            if (isElectron()) {
                return true;
            }
            return false;
        }
    };

    const getSyncStatus = async () => {
        if (!isElectron()) {
            return null;
        }

        const status = await syncService.getSyncStatus();

        const hasCloudToken = !!getStorageItem('cloudToken');

        const finalStatus = {
            ...status,
            hasCloudToken
        };

        return finalStatus;
    };

    const clearCloudAuth = () => {
        if (!isElectron()) return;
        syncService.clearCloudAuth();
    };

    const syncToCloud = async () => {
        if (!isElectron() || !isOnline) {
            throw new Error('Sync not available');
        }
        return await syncService.syncToCloud();
    };

    const syncFromCloud = async () => {
        if (!isElectron() || !isOnline) {
            throw new Error('Sync not available');
        }
        return await syncService.syncFromCloud();
    };

    const clearLocalData = async () => {
        if (!isElectron()) {
            throw new Error('Clear local data only available in desktop');
        }
        return await syncService.clearLocalData();
    };

    const value = useMemo(() => ({
        user,
        isAuthenticated,
        loading,
        isOnline,
        isDesktop: isElectron(),
        login,
        register,
        logout,
        checkUsername,
        syncToCloud,
        syncFromCloud,
        getSyncStatus,
        clearLocalData,
        clearCloudAuth,
        resetSyncFlag: () => syncService.resetSyncFlag(),
    }), [user, isAuthenticated, loading, isOnline]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};