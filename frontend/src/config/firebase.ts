import { getApp, getApps, initializeApp } from 'firebase/app';

import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDMGA3KscWsGj-c63YdY_UraLs8volzb-4',
  authDomain: 'fitstudy-f87b6.firebaseapp.com',
  projectId: 'fitstudy-f87b6',
  storageBucket: 'fitstudy-f87b6.firebasestorage.app',
  messagingSenderId: '137284125173',
  appId: '1:137284125173:web:5d30757aacd083a5cae0bc',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
