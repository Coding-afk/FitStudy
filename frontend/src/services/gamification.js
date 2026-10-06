import api from './api';

export const getMyGamificationStats = async () => {
  const response = await api.get('/gamification/me');

  return response.data;
};
