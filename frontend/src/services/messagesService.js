import api from './api';

export const messagesService = {
  getConversations: async () => {
    const response = await api.get('/messages/conversations/');
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  },

  getConversationWithUser: async (username) => {
    const response = await api.get(`/messages/conversation/${username}/`);
    return response.data;
  },

  getMessages: async (conversationId) => {
    const response = await api.get(`/messages/conversations/${conversationId}/messages/`);
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  },

  sendMessage: async (conversationId, content) => {
    const response = await api.post(`/messages/conversations/${conversationId}/messages/send/`, { content });
    return response.data;
  },

  markAsRead: async (conversationId) => {
    await api.post(`/messages/conversations/${conversationId}/read/`);
  },
};
