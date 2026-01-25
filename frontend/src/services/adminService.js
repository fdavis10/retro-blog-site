import api from './api';

const adminService = {
  // Получить всех пользователей
  getUsers: async (filters = {}) => {
    let url = '/admin/users/';
    const params = new URLSearchParams();
    
    if (filters.is_approved !== undefined) {
      params.append('is_approved', filters.is_approved);
    }
    if (filters.is_admin_user !== undefined) {
      params.append('is_admin_user', filters.is_admin_user);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },

  // Создать пользователя
  createUser: async (data) => {
    const response = await api.post('/admin/users/create/', data);
    return response.data;
  },

  // Получить пользователя
  getUser: async (id) => {
    const response = await api.get(`/admin/users/${id}/`);
    return response.data;
  },

  // Обновить пользователя
  updateUser: async (id, data) => {
    const response = await api.put(`/admin/users/${id}/`, data);
    return response.data;
  },

  // Одобрить/отклонить пользователя
  approveUser: async (id) => {
    const response = await api.post(`/admin/users/${id}/approve/`);
    return response.data;
  },

  // Удалить пользователя
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}/delete/`);
    return response.data;
  },

  // Получить статистику
  getStats: async () => {
    const response = await api.get('/admin/stats/');
    return response.data;
  },
};

export default adminService;