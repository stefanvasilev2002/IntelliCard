import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CardSetPage from './pages/CardSetPage';
import StudyPage from './pages/StudyPage';
import CreateCardSetPage from './pages/CreateCardSetPage';
import EditCardSetPage from './pages/EditCardSetPage.jsx';
import AddCardPage from './pages/AddCardPage';

// Components
import LoadingSpinner from './components/LoadingSpinner';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

// Protected Route Component
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

// Public Route Component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// App Routes Component (needs to be inside AuthProvider)
const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
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

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
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