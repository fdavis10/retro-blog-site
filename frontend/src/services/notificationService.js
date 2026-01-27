import api from './api';

export const notificationService = {
  // Получить все активные уведомления
  getActiveNotifications: async () => {
    const response = await api.get('/notifications/active/');
    return response.data;
  },

  // Закрыть уведомление
  dismissNotification: async (notificationId) => {
    const response = await api.post(`/notifications/${notificationId}/dismiss/`);
    return response.data;
  },

  // Пометить как прочитанное
  markAsRead: async (notificationId) => {
    const response = await api.post(`/notifications/${notificationId}/read/`);
    return response.data;
  },

  // Получить количество непрочитанных
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count/');
    return response.data;
  },

  // === ADMIN ENDPOINTS ===

  // Получить все уведомления (админ)
  getAllNotifications: async () => {
    const response = await api.get('/notifications/admin/list/');
    return response.data;
  },

  // Создать уведомление (админ)
  createNotification: async (data) => {
    const response = await api.post('/notifications/admin/create/', data);
    return response.data;
  },

  // Получить уведомление (админ)
  getNotification: async (id) => {
    const response = await api.get(`/notifications/admin/${id}/`);
    return response.data;
  },

  // Обновить уведомление (админ)
  updateNotification: async (id, data) => {
    const response = await api.put(`/notifications/admin/${id}/`, data);
    return response.data;
  },

  // Удалить уведомление (админ)
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/admin/${id}/`);
    return response.data;
  },

  // Получить статистику (админ)
  getNotificationStats: async (id) => {
    const response = await api.get(`/notifications/admin/${id}/stats/`);
    return response.data;
  },
};

export default notificationService;