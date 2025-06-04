import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle, WifiOff, Download, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isElectron } from '../utils/environment';
import toast from 'react-hot-toast';

const SyncStatus = ({ className = '' }) => {
    const { isOnline, getSyncStatus, syncToCloud, syncFromCloud } = useAuth();
    const [syncStatus, setSyncStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showSyncModal, setShowSyncModal] = useState(false);

    if (!isElectron()) {
        return null;
    }

    useEffect(() => {
        loadSyncStatus();

        const interval = setInterval(loadSyncStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadSyncStatus = async () => {
        try {
            const status = await getSyncStatus();
            setSyncStatus(status);
        } catch (error) {
            console.error('Failed to load sync status:', error);
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
            console.error('Sync to cloud failed:', error);
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
            console.error('Sync from cloud failed:', error);
        } finally {
            setIsLoading(false);
        }
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

            {/* Sync Modal */}
            {showSyncModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex items-center space-x-3 mb-4">
                            <Cloud className="w-6 h-6 text-blue-600" />
                            <h3 className="text-lg font-medium text-gray-900">Cloud Sync</h3>
                        </div>

                        {/* Sync Status */}
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

                        {/* Sync Actions */}
                        <div className="space-y-3 mb-6">
                            <button
                                onClick={handleSyncToCloud}
                                disabled={!isOnline || !syncStatus?.hasCloudToken || isLoading}
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
                                disabled={!isOnline || !syncStatus?.hasCloudToken || isLoading}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? (
                                    <RefreshCw size={16} className="animate-spin" />
                                ) : (
                                    <Download size={16} />
                                )}
                                <span>Sync from Cloud</span>
                            </button>
                        </div>

                        {/* Help Text */}
                        <div className="text-xs text-gray-500 mb-4">
                            <p className="mb-1">• Sync to Cloud: Upload your local changes to the cloud</p>
                            <p>• Sync from Cloud: Download latest data from the cloud</p>
                        </div>

                        {/* Close Button */}
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
        </>
    );
};

export default SyncStatus;