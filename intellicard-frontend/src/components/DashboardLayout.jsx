import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Brain, LogOut, User, Plus, Monitor, Wifi, WifiOff } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { isElectron } from '../utils/environment';
import SyncStatus from './SyncStatus';

const DashboardLayout = ({ children }) => {
    const { user, logout, isOnline } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Brain },
        { name: 'Create Set', href: '/create-cardset', icon: Plus },
    ];

    const isActive = (href) => location.pathname === href;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo and Navigation */}
                        <div className="flex items-center space-x-8">
                            <Link to="/dashboard" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center">
                                    <Brain size={20} />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xl font-bold text-gray-900">IntelliCard</span>
                                    {isElectron() && (
                                        <div className="flex items-center space-x-1">
                                            <Monitor size={14} className="text-gray-500" />
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                Desktop
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Link>

                            <nav className="hidden md:flex space-x-6">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                isActive(item.href)
                                                    ? 'bg-primary-50 text-primary-600'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon size={16} />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Right side - Status and User Menu */}
                        <div className="flex items-center space-x-4">
                            {/* Network Status */}
                            <div className="flex items-center space-x-2 text-sm">
                                {isOnline ? (
                                    <div className="flex items-center space-x-1 text-green-600">
                                        <Wifi size={14} />
                                        <span className="hidden sm:inline">Online</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-1 text-red-600">
                                        <WifiOff size={14} />
                                        <span className="hidden sm:inline">Offline</span>
                                    </div>
                                )}
                            </div>

                            {/* Sync Status (Desktop only) */}
                            <SyncStatus />

                            {/* User Info */}
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <User size={16} />
                                <span className="hidden sm:inline">Welcome, {user?.username}</span>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={logout}
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                            >
                                <LogOut size={16} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation */}
            <div className="md:hidden bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex space-x-4 py-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isActive(item.href)
                                            ? 'bg-primary-50 text-primary-600'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon size={16} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Offline Banner (Desktop only) */}
            {isElectron() && !isOnline && (
                <div className="bg-yellow-50 border-b border-yellow-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-center py-2">
                            <div className="flex items-center space-x-2 text-sm text-yellow-800">
                                <WifiOff size={16} />
                                <span>You're offline. Changes will be saved locally and can be synced when you're back online.</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;