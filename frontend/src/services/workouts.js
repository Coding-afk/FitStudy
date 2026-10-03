import api from "./api";

export const getAllWorkouts = async () => {
    const response = await api.get("/workouts");
    return response.data;
}

export const getWorkout = async (workoutId) => {
    const response = await api.get(`/workouts/${workoutId}`);
    return response.data;
}