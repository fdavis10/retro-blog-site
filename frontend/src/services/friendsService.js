import api from './api';

export const friendsService = {
  sendFriendRequest: async (userId) => {
    const response = await api.post(`/friends/request/send/${userId}/`);
    return response.data;
  },

  acceptFriendRequest: async (requestId) => {
    const response = await api.post(`/friends/request/accept/${requestId}/`);
    return response.data;
  },

  rejectFriendRequest: async (requestId) => {
    const response = await api.post(`/friends/request/reject/${requestId}/`);
    return response.data;
  },

  cancelFriendRequest: async (userId) => {
    const response = await api.delete(`/friends/request/cancel/${userId}/`);
    return response.data;
  },

  removeFriend: async (userId) => {
    const response = await api.delete(`/friends/remove/${userId}/`);
    return response.data;
  },

  getMyFriends: async () => {
    const response = await api.get('/friends/my-friends/');
    return response.data;
  },

  getMySubscriptions: async () => {
    const response = await api.get('/friends/subscriptions/');
    return response.data;
  },

  getMySubscribers: async () => {
    const response = await api.get('/friends/subscribers/');
    return response.data;
  },

  getIncomingRequests: async () => {
    const response = await api.get('/friends/request/incoming/');
    return response.data;
  },

  getOutgoingRequests: async () => {
    const response = await api.get('/friends/request/outgoing/');
    return response.data;
  },

  blockUser: async (userId) => {
    const response = await api.post(`/friends/block/${userId}/`);
    return response.data;
  },

  unblockUser: async (userId) => {
    const response = await api.delete(`/friends/unblock/${userId}/`);
    return response.data;
  },

  getBlockedUsers: async () => {
    const response = await api.get('/friends/blocked/');
    return response.data;
  },

  getInternalNotifications: async () => {
    const response = await api.get('/friends/notifications/');
    return response.data;
  },

  markNotificationRead: async (notificationId) => {
    const response = await api.post(`/friends/notifications/${notificationId}/read/`);
    return response.data;
  },

  markAllNotificationsRead: async () => {
    const response = await api.post('/friends/notifications/read-all/');
    return response.data;
  },

  getUnreadNotificationsCount: async () => {
    const response = await api.get('/friends/notifications/unread-count/');
    return response.data;
  },

  getFriendshipStatus: async (userId) => {
    const response = await api.get(`/friends/status/${userId}/`);
    return response.data;
  },
};

export default friendsService;