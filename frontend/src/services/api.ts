/**
 * @file api.ts
 * @description Cliente HTTP Axios com interceptor de autenticação JWT e tipagem TypeScript.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Axios (^1.7.2): Cliente HTTP baseado em promises.
 *    Doc Oficial: https://axios-http.com/docs/intro
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para anexar o Token JWT em todas as requisições autenticadas
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('@ServicoFacil:token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
