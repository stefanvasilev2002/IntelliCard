import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

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

    useEffect(() => {
        const initializeAuth = () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                try {
                    const userData = JSON.parse(savedUser);
                    setUser(userData);
                    setIsAuthenticated(true);
                } catch (error) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            const token = response.data;

            localStorage.setItem('token', token);

            const userData = {
                username: credentials.username,
            };

            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            const message = error.response?.data || 'Login failed';
            return { success: false, error: message };
        }
    };

    const register = async (userData) => {
        try {
            await authAPI.register(userData);
            toast.success('Registration successful! Please log in.');
            return { success: true };
        } catch (error) {
            const message = error.response?.data || 'Registration failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        toast.success('Logged out successfully');
    };

    const checkUsername = async (username) => {
        try {
            const response = await authAPI.checkUsername(username);
            return response.data;
        } catch (error) {
            return false;
        }
    };

    const value = useMemo(() => ({
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        checkUsername,
    }), [user, isAuthenticated, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};