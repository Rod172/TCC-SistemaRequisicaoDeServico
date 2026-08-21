/**
 * Serviço de Integração HTTP com a API REST do Backend
 * 
 * Bibliotecas de Terceiros Utilizadas:
 * - axios: Cliente HTTP baseado em Promises para navegador e Node.js.
 *   Doc: https://axios-http.com
 */

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para injetar o Token JWT automaticamente em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@TCC:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
