import React, { useState, useEffect } from 'react';
import { FaTimes, FaInfoCircle, FaExclamationTriangle, FaBell, FaWrench, FaNewspaper } from 'react-icons/fa';
import notificationService from '../services/notificationService';

const NotificationBanner = () => {
  const [notifications, setNotifications] = useState([]);
  const [dismissedIds, setDismissedIds] = useState([]);

  useEffect(() => {
    loadNotifications();
    // Загружаем закрытые уведомления из localStorage
    const dismissed = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
    setDismissedIds(dismissed);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getActiveNotifications();
      setNotifications(Array.isArray(data) ? data : (data.results || []));
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleDismiss = async (notificationId) => {
    try {
      await notificationService.dismissNotification(notificationId);
      
      // Добавляем в список закрытых
      const newDismissed = [...dismissedIds, notificationId];
      setDismissedIds(newDismissed);
      localStorage.setItem('dismissedNotifications', JSON.stringify(newDismissed));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'maintenance':
        return <FaWrench />;
      case 'update':
        return <FaBell />;
      case 'news':
        return <FaNewspaper />;
      case 'warning':
        return <FaExclamationTriangle />;
      case 'info':
      default:
        return <FaInfoCircle />;
    }
  };

  // Фильтруем только не закрытые уведомления
  const activeNotifications = notifications.filter(
    notification => !dismissedIds.includes(notification.id)
  );

  if (activeNotifications.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '10px' }}>
      {activeNotifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            backgroundColor: notification.colors.bg,
            border: `1px solid ${notification.colors.border}`,
            borderLeft: `4px solid ${notification.colors.border}`,
            borderRadius: '3px',
            padding: '12px 15px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            color: notification.colors.text,
            fontSize: '13px',
            position: 'relative',
          }}
        >
          {/* Иконка */}
          <div style={{ 
            fontSize: '18px', 
            marginTop: '2px',
            flexShrink: 0 
          }}>
            {getIcon(notification.type)}
          </div>

          {/* Контент */}
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '4px',
              fontSize: '14px' 
            }}>
              {notification.title}
            </div>
            <div style={{ 
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap' 
            }}>
              {notification.message}
            </div>
            <div style={{ 
              fontSize: '11px', 
              marginTop: '6px',
              opacity: 0.7 
            }}>
              {new Date(notification.created_at).toLocaleString('ru-RU')}
            </div>
          </div>

          {/* Кнопка закрытия */}
          <button
            onClick={() => handleDismiss(notification.id)}
            style={{
              background: 'none',
              border: 'none',
              color: notification.colors.text,
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px',
              opacity: 0.6,
              transition: 'opacity 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => e.target.style.opacity = '1'}
            onMouseLeave={(e) => e.target.style.opacity = '0.6'}
            title="Закрыть"
          >
            <FaTimes />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationBanner;