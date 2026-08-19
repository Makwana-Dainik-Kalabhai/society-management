import api from './axios';

export const societyAPI = {
  getAllSocieties: () => api.get('/societies'),
  getSocietyById: (id) => api.get(`/societies/${id}`),
  createSociety: (data) => api.post('/admin/societies', data),
  updateSociety: (id, data) => api.put(`/societies/${id}`, data),
  getDashboardStats: (params) => api.get('/societies/stats', { params }),
  getReports: (params) => api.get('/reports/overview', { params })
};
