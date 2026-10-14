import api from './api';

export const getPerfectWorkoutReward = async () => {
  const response = await api.get('/rewards/perfect-workout');

  return response.data;
};

export const completePerfectWorkoutReward = async payload => {
  const response = await api.post(
    '/rewards/perfect-workout/complete',
    payload,
  );

  return response.data;
};
