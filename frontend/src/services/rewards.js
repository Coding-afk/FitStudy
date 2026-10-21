// Perfect Workout reward API wrapper. Reward data is kept separate from the ten
// study assignments to protect the study counters and experimental dataset.

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
