// File: client/src/utils/api.js
import axios from 'axios';

// Create an Axios instance with your backend URL
const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Interceptor: Automatically adds the "Authorization" header to every request
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;