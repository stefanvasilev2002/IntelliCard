import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling
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

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    checkUsername: (username) => api.get(`/auth/check-username?username=${username}`),
};

// Card Sets API
export const cardSetsAPI = {
    getAll: () => api.get('/cardsets'),
    getById: (id) => api.get(`/cardsets/${id}`),
    create: (cardSet) => api.post('/cardsets', cardSet),
    update: (id, cardSet) => api.put(`/cardsets/${id}`, cardSet),
    delete: (id) => api.delete(`/cardsets/${id}`),
};

// Cards API
export const cardsAPI = {
    getByCardSetId: (cardSetId) => api.get(`/cards/cardset/${cardSetId}`),
    create: (cardSetId, card) => api.post(`/cards/cardset/${cardSetId}`, card),
    update: (id, card) => api.put(`/cards/${id}`, card),
    delete: (id) => api.delete(`/cards/${id}`),
};

// Study API
export const studyAPI = {
    getDueCards: (cardSetId) => api.get(`/study/cardset/${cardSetId}/due`),
    getOverview: (cardSetId) => api.get(`/study/cardset/${cardSetId}/overview`),
    reviewCard: (cardId, correct, difficulty) =>
        api.post(`/study/card/${cardId}/review?correct=${correct}&difficulty=${difficulty}`),
};

// Access Requests API
export const accessRequestsAPI = {
    request: (cardSetId) => api.post(`/cardsets/${cardSetId}/access-requests`),
    getPending: (cardSetId) => api.get(`/cardsets/${cardSetId}/access-requests`),
    respond: (cardSetId, requestId, approve) =>
        api.put(`/cardsets/${cardSetId}/access-requests/${requestId}?approve=${approve}`),
    revoke: (cardSetId) =>
        api.delete(`/cardsets/${cardSetId}/access-requests/revoke`),
};

export default api;