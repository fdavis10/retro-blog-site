import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';
import notificationService from '../services/notificationService';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    
    // Загружаем закрытые из localStorage
    const dismissed = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
    setDismissedIds(dismissed);

    // Обновляем каждые 30 секунд
    const interval = setInterval(() => {
      loadNotifications();
      loadUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Закрываем dropdown при клике вне его
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getActiveNotifications();
      setNotifications(Array.isArray(data) ? data : (data.results || []));
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleDismiss = async (notificationId) => {
    try {
      await notificationService.dismissNotification(notificationId);
      
      const newDismissed = [...dismissedIds, notificationId];
      setDismissedIds(newDismissed);
      localStorage.setItem('dismissedNotifications', JSON.stringify(newDismissed));
      
      loadUnreadCount();
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen && notifications.length > 0) {
      // Помечаем все как прочитанные при открытии
      notifications.forEach(n => {
        if (!n.is_read && !dismissedIds.includes(n.id)) {
          handleMarkAsRead(n.id);
        }
      });
    }
  };

  // Фильтруем не закрытые
  const activeNotifications = notifications.filter(
    n => !dismissedIds.includes(n.id)
  );

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Колокольчик */}
      <button
        onClick={handleBellClick}
        style={{
          position: 'relative',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          borderRadius: '2px',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <FaBell style={{ fontSize: '16px' }} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '4px',
              backgroundColor: '#f02849',
              color: 'white',
              borderRadius: '10px',
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: 'bold',
              minWidth: '18px',
              textAlign: 'center',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '350px',
            maxWidth: '90vw',
            backgroundColor: 'white',
            border: '1px solid var(--fb-border)',
            borderRadius: '3px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
          }}
        >
          {/* Заголовок */}
          <div
            style={{
              padding: '12px 15px',
              borderBottom: '1px solid var(--fb-border)',
              fontWeight: 'bold',
              fontSize: '14px',
              color: 'var(--fb-text)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Уведомления</span>
            {activeNotifications.length > 0 && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'normal',
                  color: 'var(--fb-text-light)',
                }}
              >
                {activeNotifications.length}
              </span>
            )}
          </div>

          {/* Список уведомлений */}
          <div
            style={{
              maxHeight: '400px',
              overflowY: 'auto',
            }}
          >
            {activeNotifications.length === 0 ? (
              <div
                style={{
                  padding: '30px 20px',
                  textAlign: 'center',
                  color: 'var(--fb-text-light)',
                  fontSize: '13px',
                }}
              >
                <div style={{ fontSize: '40px', color: 'var(--fb-text-light)', marginBottom: '10px' }}>
                  <FaBell />
                </div>
                Нет уведомлений
              </div>
            ) : (
              activeNotifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    padding: '12px 15px',
                    borderBottom: '1px solid var(--fb-border)',
                    backgroundColor: notification.is_read ? 'white' : 'var(--fb-hover)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--fb-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = notification.is_read
                      ? 'white'
                      : 'var(--fb-hover)';
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    {/* Цветной индикатор типа */}
                    <div
                      style={{
                        width: '4px',
                        height: '100%',
                        backgroundColor: notification.colors.border,
                        borderRadius: '2px',
                        flexShrink: 0,
                      }}
                    />

                    {/* Контент */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 'bold',
                          fontSize: '13px',
                          marginBottom: '4px',
                          color: 'var(--fb-text)',
                        }}
                      >
                        {notification.title}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--fb-text-light)',
                          lineHeight: '1.4',
                          marginBottom: '4px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {notification.message}
                      </div>
                      <div
                        style={{
                          fontSize: '10px',
                          color: 'var(--fb-text-light)',
                        }}
                      >
                        {new Date(notification.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>

                    {/* Кнопка закрытия */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(notification.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--fb-text-light)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '4px',
                        opacity: 0.6,
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => (e.target.style.opacity = '1')}
                      onMouseLeave={(e) => (e.target.style.opacity = '0.6')}
                      title="Закрыть"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;