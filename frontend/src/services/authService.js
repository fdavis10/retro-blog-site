import api from './api';

export const authService = {

  login: async (username, password) => {
    const response = await api.post('/auth/login/', { username, password });
    const { access, refresh, user } = response.data;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },


  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      await api.post('/auth/logout/', { refresh: refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },


  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },


  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },


  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },


  updateProfile: async (data) => {
    const formData = new FormData();
    
    if (data.first_name) formData.append('first_name', data.first_name);
    if (data.last_name) formData.append('last_name', data.last_name);
    if (data.email) formData.append('email', data.email);
    
    if (data.profile) {
      if (data.profile.bio) formData.append('profile.bio', data.profile.bio);
      if (data.profile.location) formData.append('profile.location', data.profile.location);
      if (data.profile.website) formData.append('profile.website', data.profile.website);
      if (data.profile.birth_date) formData.append('profile.birth_date', data.profile.birth_date);
      if (data.profile.avatar) formData.append('profile.avatar', data.profile.avatar);
    }
    
    const response = await api.put('/auth/profile/update/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    

    const currentUser = authService.getCurrentUser();
    const updatedUser = { ...currentUser, ...response.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return response.data;
  },


  getUserProfile: async (username) => {
    const response = await api.get(`/auth/profile/${username}/`);
    return response.data;
  },
};