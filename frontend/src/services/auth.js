import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reload,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from 'firebase/auth';

import {auth} from '../config/firebase';

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

export const deleteRegisteredUser = async user => {
  if (!user) {
    return;
  }

  await deleteUser(user);
};

export const reauthenticateCurrentUser = async currentPassword => {
  const user = auth.currentUser;

  if (!user || !user.email) {
    const error = new Error('No authenticated user is available.');
    error.code = 'auth/no-current-user';
    throw error;
  }

  const credential = EmailAuthProvider.credential(
    user.email,
    currentPassword,
  );

  await reauthenticateWithCredential(user, credential);

  // Force a fresh ID token so the backend can verify that the account
  // was re-authenticated recently before sensitive account changes.
  await user.getIdToken(true);
};

export const refreshCurrentUser = async () => {
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  await reload(user);
  await user.getIdToken(true);

  return user;
};

export const changePassword = async (currentPassword, newPassword) => {
  const user = auth.currentUser;

  if (!user) {
    const error = new Error('No authenticated user is available.');
    error.code = 'auth/no-current-user';
    throw error;
  }

  await reauthenticateCurrentUser(currentPassword);
  await updatePassword(user, newPassword);
};
