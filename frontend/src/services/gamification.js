import api from './api';

export const getMyGamificationStats = async () => {
  const response = await api.get('/gamification/me');

  return response.data;
};

export const getLeaderboard = async (limit = 25) => {
  const response = await api.get('/gamification/leaderboard', {
    params: {
      limit,
    },
  });

  return response.data;
};
