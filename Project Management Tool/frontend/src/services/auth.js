import api from './api';

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', data.token);
  return data.user;
};

export const register = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  localStorage.setItem('token', data.token);
  return data.user;
};

export const logout = () => localStorage.removeItem('token');

export const getCurrentUser = () => null;
