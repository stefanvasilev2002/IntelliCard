import axios from 'axios';
import {getStorageItem, removeStorageItem, setStorageItem} from '../utils/environment';
import toast from 'react-hot-toast';

const LOCAL_API = 'http://localhost:8080/api/v1';
const CLOUD_API = import.meta.env.VITE_CLOUD_API;

const createCloudAPI = () => {
    const api = axios.create({
        baseURL: CLOUD_API,
        timeout: 30000,
    });

    api.interceptors.request.use((config) => {
        const cloudToken = getStorageItem('cloudToken');
        if (cloudToken) {
            config.headers.Authorization = `Bearer ${cloudToken}`;
        }
        return config;
    });

    return api;
};

class SyncService {
    constructor() {
        this.syncInProgress = false;
        this.cloudAPI = createCloudAPI();
        this.passwordCallback = null;
    }

    setPasswordCallback(callback) {
        this.passwordCallback = callback;
    }

    async authenticateWithCloud() {
        try {
            const user = getStorageItem('user');
            if (!user) {
                throw new Error('No user found. Please login first.');
            }

            const userData = typeof user === 'string' ? JSON.parse(user) : user;

            if (!this.passwordCallback) {
                throw new Error('Password callback not set');
            }

            const password = await this.passwordCallback(userData.username);
            if (!password) {
                throw new Error('Password required for cloud sync');
            }

            const response = await axios.post(`${CLOUD_API}/auth/login`, {
                username: userData.username,
                password: password
            });

            const cloudToken = response.data;
            setStorageItem('cloudToken', cloudToken);

            this.cloudAPI = createCloudAPI();

            return cloudToken;
        } catch (error) {
            if (error.message.includes('Password required') || error.message.includes('Password callback')) {
                throw error;
            }
            throw new Error('Failed to authenticate with cloud. Please check your credentials.');
        }
    }

    async ensureCloudAuth() {
        const cloudToken = getStorageItem('cloudToken');

        if (!cloudToken) {
            return await this.authenticateWithCloud();
        }

        try {
            await this.cloudAPI.get('/cardsets');
            return cloudToken;
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                return await this.authenticateWithCloud();
            }
            throw error;
        }
    }

    async getSyncStatus() {
        const hasCloudToken = !!getStorageItem('cloudToken');
        const lastSync = getStorageItem('lastSyncTime');

        try {
            const localCardSetsResponse = await axios.get(`${LOCAL_API}/cardsets`);
            const localCardSets = localCardSetsResponse.data;

            let totalUnsyncedCards = 0;
            for (const cardSet of localCardSets) {
                const localCardsResponse = await axios.get(`${LOCAL_API}/cards/cardset/${cardSet.id}`);
                totalUnsyncedCards += localCardsResponse.data.length;
            }

            return {
                hasCloudToken,
                lastSync,
                unsyncedCardSets: localCardSets.length,
                unsyncedCards: totalUnsyncedCards
            };
        } catch (error) {
            return {
                hasCloudToken,
                lastSync,
                unsyncedCardSets: 0,
                unsyncedCards: 0
            };
        }
    }

    async syncToCloud() {
        if (this.syncInProgress) {
            throw new Error('Sync already in progress');
        }

        this.syncInProgress = true;
        let successCount = 0;
        let errorCount = 0;

        try {
            toast.loading('Authenticating with cloud...', { id: 'sync-progress' });

            await this.ensureCloudAuth();

            toast.loading('Syncing to cloud...', { id: 'sync-progress' });

            const localCardSetsResponse = await axios.get(`${LOCAL_API}/cardsets`);
            const localCardSets = localCardSetsResponse.data;

            if (localCardSets.length === 0) {
                toast.dismiss('sync-progress');
                toast.success('No card sets to sync');
                return { success: true, successCount: 0, errorCount: 0 };
            }

            for (const cardSet of localCardSets) {
                try {
                    const cloudCardSetResponse = await this.cloudAPI.post('/cardsets', {
                        name: cardSet.name,
                        description: cardSet.description,
                        isPublic: cardSet.isPublic
                    });

                    const cloudCardSetId = cloudCardSetResponse.data.id;

                    const localCardsResponse = await axios.get(`${LOCAL_API}/cards/cardset/${cardSet.id}`);
                    const localCards = localCardsResponse.data;

                    for (const card of localCards) {
                        await this.cloudAPI.post(`/cards/cardset/${cloudCardSetId}`, {
                            term: card.term,
                            definition: card.definition
                        });
                        successCount++;
                    }

                } catch (error) {
                    errorCount++;
                }
            }

            const now = new Date().toISOString();
            setStorageItem('lastSyncTime', now);

            toast.dismiss('sync-progress');

            if (errorCount === 0) {
                toast.success(`Successfully synced ${localCardSets.length} card sets with ${successCount} cards to cloud!`);
                return { success: true, successCount, errorCount: 0 };
            } else {
                toast.error(`Synced with ${errorCount} errors`);
                return { success: false, successCount, errorCount };
            }

        } catch (error) {
            toast.dismiss('sync-progress');
            if (error.message.includes('Password required') || error.message.includes('authenticate')) {
                toast.error(error.message);
            } else {
                toast.error('Failed to sync to cloud');
            }
            throw error;
        } finally {
            this.syncInProgress = false;
        }
    }

    async syncFromCloud() {
        if (this.syncInProgress) {
            throw new Error('Sync already in progress');
        }

        this.syncInProgress = true;

        try {
            toast.loading('Authenticating with cloud...', { id: 'sync-progress' });

            await this.ensureCloudAuth();

            toast.loading('Syncing from cloud...', { id: 'sync-progress' });

            const cloudCardSetsResponse = await this.cloudAPI.get('/cardsets');
            const cloudCardSets = cloudCardSetsResponse.data;
            if (cloudCardSets.length === 0) {
                toast.dismiss('sync-progress');
                toast.success('No card sets found in cloud');
                return { success: true, cardSetsUpdated: 0, cardsUpdated: 0 };
            }

            let totalCards = 0;

            for (const cloudCardSet of cloudCardSets) {
                try {
                    const localCardSetResponse = await axios.post(`${LOCAL_API}/cardsets`, {
                        name: cloudCardSet.name,
                        description: cloudCardSet.description,
                        isPublic: cloudCardSet.isPublic
                    });

                    const localCardSetId = localCardSetResponse.data.id;

                    const cloudCardsResponse = await this.cloudAPI.get(`/cards/cardset/${cloudCardSet.id}`);
                    const cloudCards = cloudCardsResponse.data;

                    for (const card of cloudCards) {
                        await axios.post(`${LOCAL_API}/cards/cardset/${localCardSetId}`, {
                            term: card.term,
                            definition: card.definition
                        });
                        totalCards++;
                    }

                } catch (error) {
                }
            }

            const now = new Date().toISOString();
            setStorageItem('lastSyncTime', now);

            toast.dismiss('sync-progress');
            toast.success(`Synced ${cloudCardSets.length} card sets and ${totalCards} cards from cloud!`);

            return {
                success: true,
                cardSetsUpdated: cloudCardSets.length,
                cardsUpdated: totalCards
            };

        } catch (error) {
            toast.dismiss('sync-progress');
            if (error.message.includes('Password required') || error.message.includes('authenticate')) {
                toast.error(error.message);
            } else {
                toast.error('Failed to sync from cloud');
            }
            throw error;
        } finally {
            this.syncInProgress = false;
        }
    }

    async clearLocalData() {
        try {
            const localCardSetsResponse = await axios.get(`${LOCAL_API}/cardsets`);
            const localCardSets = localCardSetsResponse.data;

            for (const cardSet of localCardSets) {
                await axios.delete(`${LOCAL_API}/cardsets/${cardSet.id}`);
            }

            toast.success('Local data cleared');
        } catch (error) {
            toast.error('Failed to clear local data');
        }
    }

    clearCloudAuth() {
        removeStorageItem('cloudToken');
        this.cloudAPI = createCloudAPI();
    }

    resetSyncFlag() {
        this.syncInProgress = false;
    }
}

export const syncService = new SyncService();