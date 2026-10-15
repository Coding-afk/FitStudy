import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import { auth } from '../config/firebase';

const usernameToEmail = username => {
  return `${username.trim().toLowerCase()}@fitstudy.app`;
};

export const registerUser = async (username, password) => {
  const email = usernameToEmail(username);

  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = async (username, password) => {
  const email = usernameToEmail(username);

  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  return signOut(auth);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};
