import api from './api';

export const getProfile = async () => {
  const response = await api.get('/profile');

  return response.data;
};

export const saveProfile = async profile => {
  const response = await api.put('/profile', profile);

  return response.data;
};
