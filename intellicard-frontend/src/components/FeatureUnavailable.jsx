import React from 'react';
import { AlertTriangle, Globe, Monitor, Wifi } from 'lucide-react';
import { isElectron, isOnline } from '../utils/environment';

const FeatureUnavailable = ({
                                feature,
                                title,
                                description,
                                reason,
                                suggestions = [],
                                className = ''
                            }) => {
    const getIcon = () => {
        switch (reason) {
            case 'web-only':
                return <Globe className="w-8 h-8 text-blue-500" />;
            case 'desktop-only':
                return <Monitor className="w-8 h-8 text-purple-500" />;
            case 'internet-required':
                return <Wifi className="w-8 h-8 text-orange-500" />;
            default:
                return <AlertTriangle className="w-8 h-8 text-gray-500" />;
        }
    };

    const getReasonText = () => {
        switch (reason) {
            case 'web-only':
                return 'This feature is only available in the web version';
            case 'desktop-only':
                return 'This feature is only available in the desktop version';
            case 'internet-required':
                return 'This feature requires an internet connection';
            default:
                return 'This feature is currently unavailable';
        }
    };

    const getEnvironmentInfo = () => {
        const env = isElectron() ? 'Desktop' : 'Web';
        const connection = isOnline() ? 'Online' : 'Offline';
        return `Currently running: ${env} (${connection})`;
    };

    return (
        <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
            <div className="flex justify-center mb-4">
                {getIcon()}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title || 'Feature Unavailable'}
            </h3>

            <p className="text-gray-600 mb-4">
                {description || getReasonText()}
            </p>

            <div className="text-sm text-gray-500 mb-4">
                {getEnvironmentInfo()}
            </div>

            {suggestions.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Suggestions:</h4>
                    <ul className="text-sm text-gray-600 space-y-1 text-left">
                        {suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start space-x-2">
                                <span className="text-gray-400">•</span>
                                <span>{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export const AIGenerationUnavailable = ({ className }) => (
    <FeatureUnavailable
        feature="aiGeneration"
        title="AI Card Generation Not Available"
        description="AI-powered card generation from documents is only available in the web version with an internet connection."
        reason={isElectron() ? 'web-only' : 'internet-required'}
        suggestions={[
            isElectron()
                ? "Use the web version at intellicard.app for AI features"
                : "Check your internet connection and try again",
            "Create cards manually using the 'Add Card' button",
            "Import cards from a text file if available"
        ]}
        className={className}
    />
);

export const GoogleDriveUnavailable = ({ className }) => (
    <FeatureUnavailable
        feature="googleDrive"
        title="Google Drive Integration Not Available"
        description="Google Drive integration is only available in the web version."
        reason="web-only"
        suggestions={[
            "Use the web version for Google Drive integration",
            "Download files from Google Drive and upload them manually",
            "Create cards manually from your documents"
        ]}
        className={className}
    />
);

export const SyncUnavailable = ({ className }) => (
    <FeatureUnavailable
        feature="sync"
        title="Cloud Sync Not Available"
        description="Cloud synchronization is only available in the desktop version."
        reason="desktop-only"
        suggestions={[
            "Download the desktop app for cloud sync features",
            "Export/import your data manually",
            "Use the web version for automatic cloud storage"
        ]}
        className={className}
    />
);

export default FeatureUnavailable;