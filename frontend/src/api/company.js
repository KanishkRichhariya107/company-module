import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance for company API
const companyApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
companyApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Company API functions
export const getAllCompanies = (params) => {
  return companyApi.get('/companies', { params });
};

export const getCompanyById = (id) => {
  return companyApi.get(`/companies/${id}`);
};

export const createCompany = (formData) => {
  return companyApi.post('/companies', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateCompany = (id, formData) => {
  return companyApi.put(`/companies/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteCompany = (id) => {
  return companyApi.delete(`/companies/${id}`);
};

export const getMyCompanies = () => {
  return companyApi.get('/companies/user/my-companies');
};

export default companyApi;
