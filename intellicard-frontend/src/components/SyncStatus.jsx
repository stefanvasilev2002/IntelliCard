import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle, WifiOff, Download, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isElectron, getStorageItem } from '../utils/environment';
import { syncService } from '../services/SyncService';
import toast from 'react-hot-toast';
import PasswordModal from './PasswordModal';

const SyncStatus = ({ className = '' }) => {
    const { isOnline, getSyncStatus, syncToCloud, syncFromCloud, clearCloudAuth, resetSyncFlag } = useAuth();
    const [syncStatus, setSyncStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordModalLoading, setPasswordModalLoading] = useState(false);
    const [passwordPromiseResolve, setPasswordPromiseResolve] = useState(null);

    if (!isElectron()) {
        return null;
    }

    useEffect(() => {
        resetSyncFlag();
        loadSyncStatus();

        const passwordCallback = (username) => {
            return new Promise((resolve) => {
                setPasswordPromiseResolve(() => resolve);
                setShowPasswordModal(true);
            });
        };

        syncService.setPasswordCallback(passwordCallback);

        const interval = setInterval(loadSyncStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadSyncStatus = async () => {
        try {
            const status = await getSyncStatus();
            setSyncStatus(status);
        } catch (error) {
        }
    };

    const handleConnectToCloud = async () => {
        if (!isOnline) {
            toast.error('Internet connection required for sync');
            return;
        }

        setIsLoading(true);
        try {
            const result = await syncToCloud();
            if (result.success) {
                await loadSyncStatus();
                toast.success('Connected to cloud and synced successfully!');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to connect to cloud');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSyncToCloud = async () => {
        if (!isOnline) {
            toast.error('Internet connection required for sync');
            return;
        }

        setIsLoading(true);
        try {
            const result = await syncToCloud();
            if (result.success) {
                await loadSyncStatus();
                setShowSyncModal(false);
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const handleSyncFromCloud = async () => {
        if (!isOnline) {
            toast.error('Internet connection required for sync');
            return;
        }

        setIsLoading(true);
        try {
            const result = await syncFromCloud();
            if (result.success) {
                await loadSyncStatus();
                setShowSyncModal(false);
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const getCurrentUsername = () => {
        const user = getStorageItem('user');
        if (user) {
            const userData = typeof user === 'string' ? JSON.parse(user) : user;
            return userData.username || 'Unknown';
        }
        return 'Unknown';
    };

    const handlePasswordSubmit = (password) => {
        setPasswordModalLoading(true);
        if (passwordPromiseResolve) {
            passwordPromiseResolve(password);
            setPasswordPromiseResolve(null);
        }
        setShowPasswordModal(false);
        setTimeout(() => setPasswordModalLoading(false), 100);
    };

    const handlePasswordCancel = () => {
        if (passwordPromiseResolve) {
            passwordPromiseResolve(null);
            setPasswordPromiseResolve(null);
        }
        setShowPasswordModal(false);
        setPasswordModalLoading(false);
        setIsLoading(false);
        resetSyncFlag();
    };

    const handleDisconnectFromCloud = () => {
        clearCloudAuth();
        loadSyncStatus();
        toast.success('Disconnected from cloud');
    };

    const getSyncIcon = () => {
        if (!isOnline) return <WifiOff size={16} className="text-gray-400" />;
        if (!syncStatus?.hasCloudToken) return <CloudOff size={16} className="text-gray-400" />;
        if (syncStatus?.unsyncedCardSets > 0 || syncStatus?.unsyncedCards > 0) {
            return <AlertCircle size={16} className="text-orange-500" />;
        }
        return <CheckCircle size={16} className="text-green-500" />;
    };

    const getSyncText = () => {
        if (!isOnline) return 'Sync not available offline';
        if (!syncStatus?.hasCloudToken) return 'Not connected';
        if (syncStatus?.unsyncedCardSets > 0 || syncStatus?.unsyncedCards > 0) {
            return 'Changes pending';
        }
        return 'Synced';
    };

    const getSyncColor = () => {
        if (!isOnline || !syncStatus?.hasCloudToken) return 'text-gray-500';
        if (syncStatus?.unsyncedCardSets > 0 || syncStatus?.unsyncedCards > 0) {
            return 'text-orange-600';
        }
        return 'text-green-600';
    };

    const formatLastSync = (lastSync) => {
        if (!lastSync) return 'Never';

        const date = new Date(lastSync);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <>
            <button
                onClick={() => setShowSyncModal(true)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors ${className}`}
                title="Cloud sync status"
            >
                {getSyncIcon()}
                <span className={getSyncColor()}>{getSyncText()}</span>
            </button>

            {showSyncModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex items-center space-x-3 mb-4">
                            <Cloud className="w-6 h-6 text-blue-600" />
                            <h3 className="text-lg font-medium text-gray-900">Cloud Sync</h3>
                        </div>

                        <div className="mb-6 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Connection:</span>
                                <div className="flex items-center space-x-2">
                                    {isOnline ? (
                                        <>
                                            <CheckCircle size={14} className="text-green-500" />
                                            <span className="text-green-600">Online</span>
                                        </>
                                    ) : (
                                        <>
                                            <WifiOff size={14} className="text-red-500" />
                                            <span className="text-red-600">Offline</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Cloud Account:</span>
                                <div className="flex items-center space-x-2">
                                    {syncStatus?.hasCloudToken ? (
                                        <>
                                            <CheckCircle size={14} className="text-green-500" />
                                            <span className="text-green-600">Connected</span>
                                        </>
                                    ) : (
                                        <>
                                            <CloudOff size={14} className="text-gray-500" />
                                            <span className="text-gray-600">Not connected</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Last Sync:</span>
                                <span className="text-gray-900 font-medium">
                                    {formatLastSync(syncStatus?.lastSync)}
                                </span>
                            </div>

                            {syncStatus && (syncStatus.unsyncedCardSets > 0 || syncStatus.unsyncedCards > 0) && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <AlertCircle size={14} className="text-orange-600" />
                                        <span className="text-sm font-medium text-orange-900">Pending Changes</span>
                                    </div>
                                    <div className="text-xs text-orange-700 space-y-1">
                                        {syncStatus.unsyncedCardSets > 0 && (
                                            <div>{syncStatus.unsyncedCardSets} card set(s) need syncing</div>
                                        )}
                                        {syncStatus.unsyncedCards > 0 && (
                                            <div>{syncStatus.unsyncedCards} card(s) need syncing</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 mb-6">
                            {!syncStatus?.hasCloudToken ? (
                                <button
                                    onClick={handleConnectToCloud}
                                    disabled={!isOnline || isLoading}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isLoading ? (
                                        <RefreshCw size={16} className="animate-spin" />
                                    ) : (
                                        <Cloud size={16} />
                                    )}
                                    <span>Connect to Cloud & Sync</span>
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSyncToCloud}
                                        disabled={!isOnline || isLoading}
                                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading ? (
                                            <RefreshCw size={16} className="animate-spin" />
                                        ) : (
                                            <Upload size={16} />
                                        )}
                                        <span>Sync to Cloud</span>
                                    </button>

                                    <button
                                        onClick={handleSyncFromCloud}
                                        disabled={!isOnline || isLoading}
                                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading ? (
                                            <RefreshCw size={16} className="animate-spin" />
                                        ) : (
                                            <Download size={16} />
                                        )}
                                        <span>Sync from Cloud</span>
                                    </button>
                                </>
                            )}
                        </div>

                        {syncStatus?.hasCloudToken && (
                            <div className="border-t pt-3 mb-4">
                                <button
                                    onClick={handleDisconnectFromCloud}
                                    className="w-full text-sm text-red-600 hover:text-red-700 transition-colors"
                                >
                                    Disconnect from Cloud
                                </button>
                            </div>
                        )}

                        <div className="text-xs text-gray-500 mb-4">
                            {!syncStatus?.hasCloudToken ? (
                                <p>• Connect to cloud to sync your data across devices</p>
                            ) : (
                                <>
                                    <p className="mb-1">• Sync to Cloud: Upload your local changes to the cloud</p>
                                    <p>• Sync from Cloud: Download latest data from the cloud</p>
                                </>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowSyncModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                                disabled={isLoading}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PasswordModal
                isOpen={showPasswordModal}
                onClose={handlePasswordCancel}
                onSubmit={handlePasswordSubmit}
                username={getCurrentUsername()}
                isLoading={passwordModalLoading}
            />
        </>
    );
};

export default SyncStatus;