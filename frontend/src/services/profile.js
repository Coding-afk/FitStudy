// Profile API wrapper for participant profile, screening, username, and account deletion.
// Sensitive operations are still authorized and validated by the backend.

import api from './api';

export const getProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

export const saveProfile = async profile => {
  const response = await api.put('/profile', profile);
  return response.data;
};

export const changeUsername = async username => {
  const response = await api.patch('/profile/username', {
    username,
  });

  return response.data;
};


export const deleteAccount = async () => {
  // Account deletion is performed by the authenticated backend so it can
  // remove both Firestore study data and the matching Firebase Auth user.
  const response = await api.delete('/profile');
  return response.data;
};

export const submitHealthScreening = async (
  screening,
  warningAcknowledged = false,
) => {
  const response = await api.post('/profile/screening', {
    ...screening,
    warningAcknowledged,
  });

  return response.data;
};
