import axios from 'axios';
import { isElectron, getStorageItem, setStorageItem, removeStorageItem } from '../utils/environment';

const getApiBaseUrl = () => {
    if (isElectron()) {
        return 'http://localhost:8080/api/v1';
    } else {
        return import.meta.env.VITE_API_BASE_URL;
    }
};

const api = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 30000,
});

api.interceptors.request.use((config) => {
    if (!isElectron()) {
        const token = getStorageItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!isElectron() && error.response?.status === 401) {
            removeStorageItem('token');
            removeStorageItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response;
    },

    checkUsername: async (username) => {
        const response = await api.get(`/auth/check-username?username=${username}`);
        return response;
    },

    logout: async () => {
        removeStorageItem('token');
        removeStorageItem('user');
        return { data: 'Logged out successfully' };
    }
};

export const cardSetsAPI = {
    getAll: () => api.get('/cardsets'),
    getById: (id) => api.get(`/cardsets/${id}`),
    create: (cardSet) => api.post('/cardsets', cardSet, {
        headers: { 'Content-Type': 'application/json' }
    }),
    update: (id, cardSet) => api.put(`/cardsets/${id}`, cardSet, {
        headers: { 'Content-Type': 'application/json' }
    }),
    delete: (id) => api.delete(`/cardsets/${id}`),
};

export const cardsAPI = {
    getByCardSetId: (cardSetId) => api.get(`/cards/cardset/${cardSetId}`),
    create: (cardSetId, card) => api.post(`/cards/cardset/${cardSetId}`, card, {
        headers: { 'Content-Type': 'application/json' }
    }),
    update: (id, card) => api.put(`/cards/${id}`, card, {
        headers: { 'Content-Type': 'application/json' }
    }),
    delete: (id) => api.delete(`/cards/${id}`),
};

export const studyAPI = {
    getDueCards: (cardSetId) => api.get(`/study/cardset/${cardSetId}/due`),
    getOverview: (cardSetId) => api.get(`/study/cardset/${cardSetId}/overview`),
    reviewCard: (cardId, correct, difficulty) =>
        api.post(`/study/card/${cardId}/review?correct=${correct}&difficulty=${difficulty}`, {}, {
            headers: { 'Content-Type': 'application/json' }
        }),
};

export const accessRequestsAPI = {
    request: (cardSetId) => {
        if (isElectron()) {
            throw new Error('Access requests not supported in desktop mode');
        }
        return api.post(`/cardsets/${cardSetId}/access-requests`, {}, {
            headers: { 'Content-Type': 'application/json' }
        });
    },

    getPending: (cardSetId) => {
        if (isElectron()) {
            return { data: [] };
        }
        return api.get(`/cardsets/${cardSetId}/access-requests`);
    },

    respond: (cardSetId, requestId, approve) => {
        if (isElectron()) {
            throw new Error('Access requests not supported in desktop mode');
        }
        return api.put(`/cardsets/${cardSetId}/access-requests/${requestId}?approve=${approve}`, {}, {
            headers: { 'Content-Type': 'application/json' }
        });
    },

    revoke: (cardSetId) => {
        if (isElectron()) {
            throw new Error('Access requests not supported in desktop mode');
        }
        return api.delete(`/cardsets/${cardSetId}/access-requests/revoke`);
    },
};

export const generateCardsAPI = {
    generateCards: (cardSetId, formData) => {
        return api.post(`/cards/${cardSetId}/generate-cards`, formData);
    }
};

export default api;