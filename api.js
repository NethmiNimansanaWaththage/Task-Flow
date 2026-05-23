import axios from 'axios';

const API_URL = 'http://localhost:8080/api/tasks';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAllTasks = () => api.get('');
export const getTaskById = (id) => api.get(`/${id}`);
export const createTask = (task) => api.post('', task);
export const updateTask = (id, task) => api.put(`/${id}`, task);
export const deleteTask = (id) => api.delete(`/${id}`);
export const getTasksByStatus = (status) => api.get(`/status/${status}`);

export default api;