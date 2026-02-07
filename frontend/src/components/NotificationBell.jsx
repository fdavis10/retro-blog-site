import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaTimes, FaComment, FaHeart, FaUserPlus, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import notificationService from '../services/notificationService';
import friendsService from '../services/friendsService';

const NotificationBell = () => {
  const [postNotifications, setPostNotifications] = useState([]);
  const [friendNotifications, setFriendNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadNotifications();

    // Обновляем каждые 30 секунд
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
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
      // Загружаем уведомления о постах
      const postData = await notificationService.getNotifications();
      const posts = Array.isArray(postData) ? postData : (postData.results || []);
      
      // Загружаем внутренние уведомления (друзья)
      const friendData = await friendsService.getInternalNotifications();
      const friends = Array.isArray(friendData) ? friendData : (friendData.results || []);
      
      // Загружаем количество непрочитанных внутренних уведомлений
      const friendUnreadData = await friendsService.getUnreadNotificationsCount();
      const friendUnreadCount = friendUnreadData.count || 0;

      setPostNotifications(posts);
      setFriendNotifications(friends);

      // Объединяем и сортируем по дате
      const combined = [
        ...posts.map(n => ({ ...n, type: 'post' })),
        ...friends.map(n => ({ ...n, type: 'friend' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setAllNotifications(combined);

      // Подсчитываем непрочитанные
      const postUnread = posts.filter(n => !n.is_read).length;
      setUnreadCount(postUnread + friendUnreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleMarkAsRead = async (notification) => {
    try {
      if (notification.type === 'post') {
        await notificationService.markAsRead(notification.id);
      } else if (notification.type === 'friend') {
        await friendsService.markNotificationRead(notification.id);
      }
      loadNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Помечаем все уведомления о постах
      const unreadPostNotifications = postNotifications.filter(n => !n.is_read);
      await Promise.all(
        unreadPostNotifications.map(n => notificationService.markAsRead(n.id))
      );

      // Помечаем все внутренние уведомления
      await friendsService.markAllNotificationsRead();

      loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      handleMarkAllAsRead();
    }
  };

  const getIcon = (notification) => {
    if (notification.type === 'post') {
      return notification.notification_type === 'like' 
        ? <FaHeart style={{ color: 'var(--fb-red)' }} />
        : <FaComment style={{ color: 'var(--fb-blue)' }} />;
    } else if (notification.type === 'friend') {
      switch (notification.notification_type) {
        case 'friend_request':
          return <FaUserPlus style={{ color: 'var(--fb-blue)' }} />;
        case 'friend_accepted':
          return <FaUserCheck style={{ color: 'var(--fb-green)' }} />;
        case 'friend_rejected':
          return <FaUserTimes style={{ color: 'var(--fb-red)' }} />;
        case 'new_subscriber':
          return <FaUserPlus style={{ color: 'var(--fb-blue)' }} />;
        default:
          return <FaBell />;
      }
    }
    return <FaBell />;
  };

  const getNotificationText = (notification) => {
    if (notification.type === 'post') {
      return (
        <>
          <Link
            to={`/profile/${notification.actor.username}`}
            style={{ fontWeight: 'bold', color: 'var(--fb-blue)' }}
          >
            {notification.actor.first_name && notification.actor.last_name
              ? `${notification.actor.first_name} ${notification.actor.last_name}`
              : notification.actor.username}
          </Link>
          {' '}
          <span style={{ color: 'var(--fb-text)' }}>
            {notification.notification_type === 'like' 
              ? 'оценил(а) ваш пост'
              : 'прокомментировал(а) ваш пост'}
          </span>
        </>
      );
    } else if (notification.type === 'friend') {
      return (
        <>
          <Link
            to={`/profile/${notification.from_user.username}`}
            style={{ fontWeight: 'bold', color: 'var(--fb-blue)' }}
          >
            {notification.from_user.first_name && notification.from_user.last_name
              ? `${notification.from_user.first_name} ${notification.from_user.last_name}`
              : notification.from_user.username}
          </Link>
          {' '}
          <span style={{ color: 'var(--fb-text)' }}>
            {notification.type_display.toLowerCase()}
          </span>
        </>
      );
    }
  };

  const handleAcceptRequest = async (notification) => {
    try {
      const requests = await friendsService.getIncomingRequests();
      const request = requests.find(r => r.from_user.id === notification.from_user.id);
      
      if (request) {
        await friendsService.acceptFriendRequest(request.id);
        loadNotifications();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async (notification) => {
    try {
      const requests = await friendsService.getIncomingRequests();
      const request = requests.find(r => r.from_user.id === notification.from_user.id);
      
      if (request) {
        await friendsService.rejectFriendRequest(request.id);
        loadNotifications();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const getNotificationLink = (notification) => {
    if (notification.type === 'post' && notification.post) {
      return `/post/${notification.post}`;
    }
    return null;
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
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

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '400px',
            maxWidth: '90vw',
            backgroundColor: 'white',
            border: '1px solid var(--fb-border)',
            borderRadius: '3px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1001,
            maxHeight: '500px',
            overflowY: 'auto',
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
              position: 'sticky',
              top: 0,
              backgroundColor: 'white',
              zIndex: 1,
            }}
          >
            <span>Уведомления</span>
            {allNotifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  fontSize: '11px',
                  color: 'var(--fb-blue)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Прочитать все
              </button>
            )}
          </div>

          {/* Список уведомлений */}
          {allNotifications.length === 0 ? (
            <div
              style={{
                padding: '30px 20px',
                textAlign: 'center',
                color: 'var(--fb-text-light)',
                fontSize: '13px',
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>
                <FaBell />
              </div>
              Нет уведомлений
            </div>
          ) : (
            allNotifications.map((notification) => {
              const link = getNotificationLink(notification);
              const content = (
                <div
                  style={{
                    padding: '12px 15px',
                    borderBottom: '1px solid var(--fb-border)',
                    backgroundColor: notification.is_read ? 'white' : 'var(--fb-hover)',
                    cursor: link ? 'pointer' : 'default',
                  }}
                  onClick={() => {
                    if (link) {
                      window.location.href = link;
                    }
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '24px', marginTop: '5px' }}>
                      {getIcon(notification)}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', marginBottom: '5px' }}>
                        {getNotificationText(notification)}
                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--fb-text-light)' }}>
                        {new Date(notification.created_at).toLocaleString('ru-RU')}
                      </div>

                      {/* Кнопки для заявки в друзья */}
                      {notification.type === 'friend' && 
                       notification.notification_type === 'friend_request' && 
                       !notification.is_read && (
                        <div style={{ marginTop: '8px', display: 'flex', gap: '5px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptRequest(notification);
                            }}
                            className="btn btn-primary btn-sm"
                          >
                            Принять
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRejectRequest(notification);
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            Отклонить
                          </button>
                        </div>
                      )}
                    </div>

                    {!notification.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--fb-text-light)',
                          cursor: 'pointer',
                          fontSize: '14px',
                          padding: '4px',
                        }}
                        title="Отметить как прочитанное"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                </div>
              );

              return <div key={`${notification.type}-${notification.id}`}>{content}</div>;
            })
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;