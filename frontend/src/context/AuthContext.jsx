import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      // ИСПРАВЛЕНИЕ: Проверяем валидность данных при загрузке
      if (savedUser.username && savedUser.id) {
        setUser(savedUser);
      } else {
        console.error('Invalid user data in localStorage:', savedUser);
        // Очищаем невалидные данные
        authService.logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    
    // ИСПРАВЛЕНИЕ: Проверяем данные перед установкой
    if (!data.user.username || !data.user.id) {
      throw new Error('Invalid user data received from server');
    }
    
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (userData) => {
    // ИСПРАВЛЕНИЕ: Проверяем что получили валидные данные
    if (!userData) {
      console.error('updateUser called with null/undefined');
      return;
    }
    
    if (!userData.username || !userData.id) {
      console.error('updateUser called with invalid data:', userData);
      return;
    }
    
    // ИСПРАВЛЕНИЕ: Логируем для отладки
    console.log('Updating user in context:', {
      username: userData.username,
      id: userData.id,
      is_admin_user: userData.is_admin_user,
      is_staff: userData.is_staff,
      is_superuser: userData.is_superuser
    });
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    // is_admin_user - может создавать посты
    isAdmin: user?.is_admin_user || false,
    // is_superuser или is_staff - доступ к админ-панели
    isSuperuser: user?.is_superuser || user?.is_staff || false,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};