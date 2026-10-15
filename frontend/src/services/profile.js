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
