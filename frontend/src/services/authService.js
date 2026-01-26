import api from './api';

export const authService = {
  // Вход
  login: async (username, password) => {
    const response = await api.post('/auth/login/', { username, password });
    const { access, refresh, user } = response.data;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  // Выход
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

  // Получить текущего пользователя
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Проверка аутентификации
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  // Получить профиль
  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  // Обновить профиль - ИСПРАВЛЕНО!
  updateProfile: async (data) => {
    const formData = new FormData();
    
    // Добавляем базовые поля пользователя
    if (data.first_name !== undefined) formData.append('first_name', data.first_name);
    if (data.last_name !== undefined) formData.append('last_name', data.last_name);
    if (data.email !== undefined) formData.append('email', data.email);
    
    // ИСПРАВЛЕНИЕ: Правильное формирование вложенных данных профиля
    if (data.profile) {
      // Для вложенных полей используем JSON-строку
      const profileData = {};
      
      // ВАЖНО: Пустые строки преобразуем в null для необязательных полей
      if (data.profile.bio !== undefined) {
        profileData.bio = data.profile.bio || '';
      }
      if (data.profile.location !== undefined) {
        profileData.location = data.profile.location || '';
      }
      if (data.profile.website !== undefined) {
        profileData.website = data.profile.website || '';
      }
      if (data.profile.birth_date !== undefined) {
        // Для даты: если пустая строка, отправляем null
        profileData.birth_date = data.profile.birth_date || null;
      }
      if (data.profile.email_notifications !== undefined) {
        profileData.email_notifications = data.profile.email_notifications;
      }
      
      // Добавляем JSON-строку с данными профиля
      formData.append('profile', JSON.stringify(profileData));
      
      // Аватар добавляем отдельно как файл
      if (data.profile.avatar && data.profile.avatar instanceof File) {
        formData.append('avatar', data.profile.avatar);
      }
    }
    
    console.log('Sending profile update...', {
      has_avatar: formData.has('avatar'),
      profile_data: JSON.parse(formData.get('profile'))
    });
    
    const response = await api.put('/auth/profile/update/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const updatedUser = response.data;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return updatedUser;
  },

  // Получить профиль другого пользователя
  getUserProfile: async (username) => {
    const response = await api.get(`/auth/profile/${username}/`);
    return response.data;
  },

  // Отправить заявку на регистрацию
  register: async (data) => {
    const response = await api.post('/auth/register/', data);
    return response.data;
  },

  // Подтвердить email кодом
  verifyEmail: async (requestId, code) => {
    const response = await api.post('/auth/verify-email/', {
      request_id: requestId,
      code: code
    });
    return response.data;
  },

  // Повторно отправить код
  resendVerificationCode: async (requestId) => {
    const response = await api.post('/auth/resend-code/', {
      request_id: requestId
    });
    return response.data;
  },
};