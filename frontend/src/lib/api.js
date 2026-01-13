import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export const customersAPI = {
  getAll: (search = '') => api.get(`/customers/${search ? `?search=${search}` : ''}`),
  getById: (id) => api.get(`/customers/${id}`),
  getByPhone: (phone) => api.get(`/customers/phone/${phone}`),
  create: (data) => api.post('/customers/', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

export const appointmentsAPI = {
  getAll: (params = {}) => api.get('/appointments/', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  getSlots: (date, type = 'test_drive') => api.get(`/appointments/slots?date=${date}&type=${type}`),
  getToday: () => api.get('/appointments/today'),
  create: (data) => api.post('/appointments/', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  delete: (id) => api.delete(`/appointments/${id}`),
};

export const complaintsAPI = {
  getAll: (params = {}) => api.get('/complaints/', { params }),
  getOpen: () => api.get('/complaints/open'),
  getStats: () => api.get('/complaints/stats'),
  getById: (id) => api.get(`/complaints/${id}`),
  getCategories: () => api.get('/complaints/categories'),
  create: (data) => api.post('/complaints/', data),
  update: (id, data) => api.put(`/complaints/${id}`, data),
  updateStatus: (id, status, resolution = '') => api.patch(`/complaints/${id}/status`, { status, resolution }),
  delete: (id) => api.delete(`/complaints/${id}`),
};

export const leadsAPI = {
  getAll: (params = {}) => api.get('/leads/', { params }),
  getPipeline: () => api.get('/leads/pipeline'),
  getStats: () => api.get('/leads/stats'),
  getStages: () => api.get('/leads/stages'),
  getById: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads/', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  updateStage: (id, stage) => api.patch(`/leads/${id}/stage`, { stage }),
  convert: (id) => api.post(`/leads/${id}/convert`),
  delete: (id) => api.delete(`/leads/${id}`),
};

export const vehiclesAPI = {
  getAll: (params = {}) => api.get('/vehicles/', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  getByModel: (model) => api.get(`/vehicles/model/${model}`),
  getOffers: () => api.get('/vehicles/offers'),
  getModels: () => api.get('/vehicles/models'),
  create: (data) => api.post('/vehicles/', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

export const callsAPI = {
  getActive: () => api.get('/calls/active'),
  getActiveById: (id) => api.get(`/calls/active/${id}`),
  getLogs: () => api.get('/calls/logs'),
  getLogById: (id) => api.get(`/calls/logs/${id}`),
  getTranscript: (id) => api.get(`/calls/transcript/${id}`),
  getStats: () => api.get('/calls/stats'),
  takeover: (id, reason = 'manual') => api.post(`/calls/${id}/takeover`, { reason }),
  end: (id, outcome = 'resolved') => api.post(`/calls/${id}/end`, { outcome }),
};

export const demoAPI = {
  startCall: (data = {}) => api.post('/demo/start', data),
  sendMessage: (callId, message) => api.post('/demo/message', { call_id: callId, message }),
  takeover: (callId, reason = 'Manual takeover') => api.post('/demo/takeover', { call_id: callId, reason }),
  sendHumanMessage: (callId, message) => api.post('/demo/human-message', { call_id: callId, message }),
  endCall: (callId, outcome = 'resolved') => api.post('/demo/end', { call_id: callId, outcome }),
  getStatus: (callId) => api.get(`/demo/status/${callId}`),
};

export default api;
