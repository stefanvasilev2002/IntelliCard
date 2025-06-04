import { getFeatureFlags } from '../utils/environment';

export const features = getFeatureFlags();

export const featureDescriptions = {
    aiGeneration: {
        name: 'AI Card Generation',
        description: 'Generate flashcards from documents using AI',
        icon: 'Wand2',
        requiresInternet: true,
        webOnly: true
    },
    googleDrive: {
        name: 'Google Drive Integration',
        description: 'Import documents directly from Google Drive',
        icon: 'Cloud',
        requiresInternet: true,
        webOnly: true
    },
    offlineMode: {
        name: 'Offline Study',
        description: 'Study cards without internet connection',
        icon: 'Wifi',
        desktopOnly: true
    },
    localDatabase: {
        name: 'Local Storage',
        description: 'Store your data locally on your device',
        icon: 'Database',
        desktopOnly: true
    },
    manualSync: {
        name: 'Cloud Sync',
        description: 'Sync your data with the cloud manually',
        icon: 'RefreshCw',
        desktopOnly: true
    },
    desktopNotifications: {
        name: 'Desktop Notifications',
        description: 'Get reminders for study sessions',
        icon: 'Bell',
        desktopOnly: true
    }
};

export const isFeatureAvailable = (featureName) => {
    return features[featureName] === true;
};

export const getUnavailableFeatures = () => {
    const unavailable = [];

    Object.entries(featureDescriptions).forEach(([key, desc]) => {
        if (!features[key]) {
            let reason = 'Not available';

            if (desc.webOnly && features.offlineMode) {
                reason = 'Web version only';
            } else if (desc.desktopOnly && !features.offlineMode) {
                reason = 'Desktop version only';
            } else if (desc.requiresInternet && !navigator.onLine) {
                reason = 'Requires internet connection';
            }

            unavailable.push({
                ...desc,
                key,
                reason
            });
        }
    });

    return unavailable;
};