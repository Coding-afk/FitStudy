import api from './api';

export const saveSurveyResponse = async survey => {
    const response = await api.post('/survey-responses', survey);
    return response.data;
}