import api from './axios';

export const userAPI = {
  getMembers: (params) => api.get('/society/members', { params }),
  getMemberById: (id) => api.get(`/society/members/${id}`),
  createMember: (data) => api.post('/society/members', data),
  updateMember: (id, data) => api.put(`/society/members/${id}`, data),
  deleteMember: (id) => api.delete(`/society/members/${id}`),
  bulkImportMembers: (data) => api.post('/society/members/bulk-import', data),
  getSocietyAdmins: () => api.get('/admin/admins')
};
