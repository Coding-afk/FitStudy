import api from './api';

export const getAllWorkouts = async () => {
  const response = await api.get('/workouts');

  return response.data;
};

export const getWorkout = async workoutId => {
  const response = await api.get(`/workouts/${workoutId}`);

  return response.data;
};

export const saveWorkoutResult = async result => {
  const response = await api.post('/workout-results', result);

  return response.data;
};



export const discardAssignment = async assignmentId => {
  const response = await api.post(`/assignments/${assignmentId}/discard`);

  return response.data;
};
