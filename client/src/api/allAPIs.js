import api from './axios';
export { userAPI } from './userAPI';
export { authAPI } from './authAPI';
export { societyAPI } from './societyAPI';

export const complaintAPI = {
  getComplaints: (params) => api.get('/complaints', { params }),
  getComplaintById: (id) => api.get(`/complaints/${id}`),
  createComplaint: (data) => api.post('/complaints', data),
  updateStatus: (id, data) => api.put(`/complaints/${id}`, data),
  addComment: (id, message) => api.post(`/complaints/${id}/comments`, { message })
};

export const maintenanceAPI = {
  getBills: (params) => api.get('/maintenance', { params }),
  createBill: (data) => api.post('/maintenance', data),
  getDefaulters: (params) => api.get('/maintenance/defaulters', { params }),
  getMyDues: () => api.get('/maintenance/dues')
};

export const paymentAPI = {
  getAllPayments: (params) => api.get('/payments', { params }),
  getMyPayments: () => api.get('/payments/my-payments'),
  initiateOrder: (maintenanceId) => api.post('/payments/initiate', { maintenanceId }),
  verifyPayment: (data) => api.post('/payments/verify', data),
  recordOffline: (data) => api.post('/payments/record', data),
  getReceiptDownloadUrl: (id) => `/api/payments/receipt/${id}`
};

export const expenseAPI = {
  getExpenses: (params) => api.get('/expenses', { params }),
  createExpense: (data) => api.post('/expenses', data),
  updateExpense: (id, data) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  getReport: () => api.get('/expenses/report')
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  createNotification: (data) => api.post('/notifications', data),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`)
};

export const communityAPI = {
  getEvents: () => api.get('/community/events'),
  createEvent: (data) => api.post('/community/events', data),
  registerEvent: (id, attendees) => api.post(`/community/events/${id}/register`, { attendees }),
  getPolls: () => api.get('/community/polls'),
  createPoll: (data) => api.post('/community/polls', data),
  votePoll: (id, optionIndex) => api.post(`/community/polls/${id}/vote`, { optionIndex }),
  getDocuments: (params) => api.get('/community/documents', { params }),
  uploadDocument: (data) => api.post('/community/documents', data)
};
