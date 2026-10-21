// Assignment API wrapper. Keeping endpoint calls here prevents screens from
// duplicating URLs and keeps assignment-generation/progression logic backend-owned.

import api from './api';

export const generateAssignments = async () => {
  const response = await api.post('/assignments/generate');

  return response.data;
};

export const getMyAssignments = async () => {
  const response = await api.get('/assignments/me');

  return response.data;
};

export const getNextAssignment = async () => {
  const response = await api.get('/assignments/next');

  return response.data;
};

export const startAssignment = async assignmentId => {
  const response = await api.post(`/assignments/${assignmentId}/start`);

  return response.data;
};
