// Post-workout survey API wrapper. The backend links the ratings to the authenticated
// participant and assignment instead of trusting condition/user fields from the client.

import api from './api';

export const saveSurveyResponse = async survey => {
  const response = await api.post('/survey-responses', survey);
  return response.data;
};
