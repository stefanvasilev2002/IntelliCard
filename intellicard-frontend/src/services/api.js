import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials, {
        headers: { 'Content-Type': 'application/json' }
    }),
    register: (userData) => api.post('/auth/register', userData, {
        headers: { 'Content-Type': 'application/json' }
    }),
    checkUsername: (username) => api.get(`/auth/check-username?username=${username}`),
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
    request: (cardSetId) => api.post(`/cardsets/${cardSetId}/access-requests`, {}, {
        headers: { 'Content-Type': 'application/json' }
    }),
    getPending: (cardSetId) => api.get(`/cardsets/${cardSetId}/access-requests`),
    respond: (cardSetId, requestId, approve) =>
        api.put(`/cardsets/${cardSetId}/access-requests/${requestId}?approve=${approve}`, {}, {
            headers: { 'Content-Type': 'application/json' }
        }),
    revoke: (cardSetId) =>
        api.delete(`/cardsets/${cardSetId}/access-requests/revoke`),
};

export const generateCardsAPI = {
    generateCards: (cardSetId, formData) => {
        console.log('API: Making request to:', `/cards/${cardSetId}/generate-cards`);
        console.log('API: FormData contents:');
        for (let [key, value] of formData.entries()) {
            console.log(`  ${key}:`, value);
        }

        return api.post(`/cards/${cardSetId}/generate-cards`, formData);
    }
};

export default api;