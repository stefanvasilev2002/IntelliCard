import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate, useLocation} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CardSetPage from './pages/CardSetPage';
import StudyPage from './pages/StudyPage';
import CreateCardSetPage from './pages/CreateCardSetPage';
import EditCardSetPage from './pages/EditCardSetPage.jsx';
import AddCardPage from './pages/AddCardPage';

import LoadingSpinner from './components/LoadingSpinner';
import PrivacyPage from "./pages/PrivacyPage.jsx";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (isAuthenticated && location.pathname === '/privacy') {
        return <PrivacyPage />;
    }

    if (isAuthenticated && location.pathname === '/') {
        return <HomePage />;
    }

    if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/"
                element={
                    <PublicRoute>
                        <HomePage />
                    </PublicRoute>
                }
            />
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <RegisterPage />
                    </PublicRoute>
                }
            />
            <Route
                path="/privacy"
                element={
                    <PublicRoute>
                        <PrivacyPage />
                    </PublicRoute>
                }
            />
            {/* Protected Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/cardset/:id"
                element={
                    <ProtectedRoute>
                        <CardSetPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/cardset/:id/study"
                element={
                    <ProtectedRoute>
                        <StudyPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/create-cardset"
                element={
                    <ProtectedRoute>
                        <CreateCardSetPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/cardset/:id/edit"
                element={
                    <ProtectedRoute>
                        <EditCardSetPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/cardset/:id/add-card"
                element={
                    <ProtectedRoute>
                        <AddCardPage />
                    </ProtectedRoute>
                }
            />

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <AuthProvider>
                    <div className="App">
                        <AppRoutes />

                        {/* Toast Notifications */}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: '#363636',
                                    color: '#fff',
                                },
                                success: {
                                    iconTheme: {
                                        primary: '#4ade80',
                                        secondary: '#fff',
                                    },
                                },
                                error: {
                                    iconTheme: {
                                        primary: '#ef4444',
                                        secondary: '#fff',
                                    },
                                },
                            }}
                        />
                    </div>
                </AuthProvider>
            </Router>
        </QueryClientProvider>
    );
}

export default App;