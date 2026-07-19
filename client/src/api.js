import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor - Add access token to requests
API.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor - Handle token expiration and refresh
API.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return API(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                // No refresh token available, redirect to login
                isRefreshing = false;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            return API.post('/auth/refresh-token', { refreshToken })
                .then((response) => {
                    const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    API.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                    processQueue(null, accessToken);
                    return API(originalRequest);
                })
                .catch((err) => {
                    processQueue(err, null);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(err);
                })
                .finally(() => {
                    isRefreshing = false;
                });
        }

        return Promise.reject(error);
    }
);

// Auth endpoints
export const signup = (payload) => API.post('/auth/signup', payload);
export const login = (payload) => API.post('/auth/login', payload);
export const refreshToken = (refreshToken) => API.post('/auth/refresh-token', { refreshToken });
export const verifyToken = () => API.get('/auth/verify-token');
export const logout = () => API.post('/auth/logout');

// Event endpoints
export const getEvents = () => API.get('/events');
export const createEvent = (data) => API.post('/events', data);
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);

// Zone endpoints
export const getZones = () => API.get('/zones');
export const createZone = (data) => API.post('/zones', data);
export const updateZone = (id, data) => API.put(`/zones/${id}`, data);
export const deleteZone = (id) => API.delete(`/zones/${id}`);

// Reward endpoints
export const getRewards = () => API.get('/rewards');
export const createReward = (data) => API.post('/rewards', data);
export const updateReward = (id, data) => API.put(`/rewards/${id}`, data);
export const deleteReward = (id) => API.delete(`/rewards/${id}`);
export const redeemReward = (qrCode) => API.post(`/rewards/redeem/${qrCode}`);
export const regenerateQR = (id) => API.post(`/rewards/${id}/regenerate-qr`);

// Scan endpoints
export const createScan = (data) => API.post('/scans', data);
export const getUserScans = (userId) => API.get(`/scans/user/${userId}`);
export const getMyScans = () => API.get('/scans/my-scans');

// Buddy AI Response endpoints
export const getBuddyResponses = () => API.get('/buddy');
export const createBuddyResponse = (data) => API.post('/buddy', data);
export const updateBuddyResponse = (id, data) => API.put(`/buddy/${id}`, data);
export const deleteBuddyResponse = (id) => API.delete(`/buddy/${id}`);

// Announcement endpoints
export const getAnnouncements = () => API.get('/announcements');
export const createAnnouncement = (data) => API.post('/announcements', data);
export const updateAnnouncement = (id, data) => API.put(`/announcements/${id}`, data);
export const deleteAnnouncement = (id) => API.delete(`/announcements/${id}`);

// Leaderboard endpoints
export const getLeaderboard = () => API.get('/leaderboard');

// Host Request endpoints
export const getHostRequests = () => API.get('/auth/host-requests');
export const approveHostRequest = (id) => API.post(`/auth/host-requests/${id}/approve`);
export const rejectHostRequest = (id, reason) => API.post(`/auth/host-requests/${id}/reject`, { reason });

export default API;
