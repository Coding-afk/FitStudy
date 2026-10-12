import axios from 'axios';

import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '../config/firebase';

import { API_URL } from '../config/api';

const api = axios.create({
  baseURL: API_URL,

  timeout: 10000,

  headers: {
    'Content-Type': 'application/json',
  },
});

let authInitialized = false;

const waitForAuth = async () => {
  if (authInitialized || auth.currentUser) {
    authInitialized = true;

    return auth.currentUser;
  }

  return new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(
      auth,

      user => {
        authInitialized = true;

        unsubscribe();

        resolve(user);
      },
    );
  });
};

api.interceptors.request.use(
  async config => {
    await waitForAuth();

    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();

      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers = {
          ...config.headers,

          Authorization: `Bearer ${token}`,
        };
      }
    }

    return config;
  },

  error => Promise.reject(error),
);

api.interceptors.response.use(
  response => response,

  error => {
    if (error.response?.status === 401) {
      console.warn('API request was unauthorized.');
    }

    return Promise.reject(error);
  },
);

export default api;
