import React from 'react';
import { Brain, Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'large', message = 'Loading...' }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-6 h-6',
        large: 'w-8 h-8'
    };

    if (size === 'large') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-2xl mb-4">
                        <Brain size={32} className="animate-pulse" />
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                        <Loader2 size={20} className="animate-spin text-primary-600" />
                        <span className="text-gray-600 font-medium">{message}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-4">
            <div className="flex items-center space-x-2">
                <Loader2 size={20} className="animate-spin text-primary-600" />
                <span className="text-gray-600">{message}</span>
            </div>
        </div>
    );
};

export default LoadingSpinner;