import axios from 'axios';

import { auth } from '../config/firebase';
import { API_URL } from '../config/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,

  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async config => {
    const user = auth.currentUser;

    console.log('API USER:', user ? user.email : 'NO USER');

    if (user) {
      const token = await user.getIdToken(true);

      console.log('TOKEN EXISTS:', !!token);

      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers = {
          ...config.headers,

          Authorization: `Bearer ${token}`,
        };
      }

      console.log('AUTH HEADER ADDED');
    }

    console.log('REQUEST URL:', config.url);

    return config;
  },
  error => Promise.reject(error),
);

export default api;
