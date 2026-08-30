import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api', timeout: 10000 });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('flight_delay_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((response) => response.data.data, (error) => Promise.reject(new Error(error.response?.data?.error || error.message)));

export default api;
