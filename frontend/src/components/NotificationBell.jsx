import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaTimes, FaComment, FaHeart, FaUserPlus, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import friendsService from '../services/friendsService';

const NotificationBell = ({ mobileMode = false, onMenuClose }) => {
  const navigate = useNavigate();
  const [postNotifications, setPostNotifications] = useState([]);
  const [friendNotifications, setFriendNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
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
        // Проверяем, не кликнули ли на overlay бургер-меню
        const isOverlayClick = event.target.classList.contains('header-overlay');
        if (!isOverlayClick) {
          setIsOpen(false);
        }
      }
    };

    // Для мобильного режима закрываем при клике на overlay
    if (mobileMode && isOpen) {
      const handleOverlayClick = () => {
        setIsOpen(false);
        if (onMenuClose) onMenuClose();
      };
      
      const overlay = document.querySelector('.header-overlay');
      if (overlay) {
        overlay.addEventListener('click', handleOverlayClick);
        return () => overlay.removeEventListener('click', handleOverlayClick);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMode, isOpen, onMenuClose]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const postData = await notificationService.getNotifications();
      const posts = Array.isArray(postData) ? postData : (postData?.results || []);
      
      const friendData = await friendsService.getInternalNotifications();
      const friends = Array.isArray(friendData) ? friendData : (friendData.results || friendData || []);
      
      const friendUnreadData = await friendsService.getUnreadNotificationsCount();
      const friendUnreadCount = friendUnreadData?.count ?? 0;

      setPostNotifications(Array.isArray(posts) ? posts : []);
      setFriendNotifications(Array.isArray(friends) ? friends : []);

      const postsArr = Array.isArray(posts) ? posts : [];
      const friendsArr = Array.isArray(friends) ? friends : [];
      const combined = [
        ...postsArr.map(n => ({ ...n, type: 'post' })),
        ...friendsArr.map(n => ({ ...n, type: 'friend' }))
      ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      setAllNotifications(combined);

      const postUnread = postsArr.filter(n => !n.is_read).length;
      setUnreadCount(postUnread + friendUnreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setAllNotifications([]);
    } finally {
      setLoading(false);
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
    // В мобильном режиме при открытии уведомлений закрываем бургер-меню
    if (mobileMode && !isOpen && onMenuClose) {
      onMenuClose();
    }
  };

  const handleNotificationClick = (notification) => {
    const link = getNotificationLink(notification);
    if (link) {
      setIsOpen(false);
      if (onMenuClose) onMenuClose();
      navigate(link);
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
    if (notification.type === 'post' && notification.actor) {
      return (
        <>
          <span style={{ fontWeight: 'bold', color: 'var(--fb-blue)' }}>
            {notification.actor.first_name && notification.actor.last_name
              ? `${notification.actor.first_name} ${notification.actor.last_name}`
              : notification.actor.username}
          </span>
          {' '}
          <span style={{ color: 'var(--fb-text)' }}>
            {notification.notification_type === 'like' 
              ? 'оценил(а) ваш пост'
              : 'прокомментировал(а) ваш пост'}
          </span>
        </>
      );
    } else if (notification.type === 'friend' && notification.from_user) {
      return (
        <>
          <span style={{ fontWeight: 'bold', color: 'var(--fb-blue)' }}>
            {notification.from_user.first_name && notification.from_user.last_name
              ? `${notification.from_user.first_name} ${notification.from_user.last_name}`
              : notification.from_user.username}
          </span>
          {' '}
          <span style={{ color: 'var(--fb-text)' }}>
            {(notification.type_display || '').toLowerCase()}
          </span>
        </>
      );
    }
    return 'Уведомление';
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
    if (notification.type === 'friend' && notification.from_user) {
      return `/profile/${notification.from_user.username}`;
    }
    if (notification.type === 'post' && notification.actor) {
      return `/profile/${notification.actor.username}`;
    }
    return null;
  };

  // Стили для мобильного режима (как пункт меню)
  if (mobileMode) {
    return (
      <div style={{ position: 'relative', width: '100%' }} ref={dropdownRef}>
        <button
          onClick={handleBellClick}
          className="header-nav-item"
          style={{
            position: 'relative',
            width: '100%',
            justifyContent: 'flex-start',
          }}
          title="Уведомления"
          type="button"
        >
          <FaBell className="header-icon" />
          <span className="header-nav-label">Уведомления</span>
          {unreadCount > 0 && (
            <span
              style={{
                marginLeft: 'auto',
                backgroundColor: '#f02849',
                color: 'white',
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: 'bold',
                minWidth: '18px',
                height: '18px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: '1',
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div
            className="notification-dropdown"
            style={{
              position: 'fixed',
              top: '60px',
              left: '0',
              right: '0',
              bottom: '0',
              backgroundColor: 'white',
              zIndex: 1002,
              overflowY: 'auto',
            }}
          >
            {/* Заголовок */}
            <div
              style={{
                padding: '15px',
                borderBottom: '1px solid var(--fb-border)',
                fontWeight: 'bold',
                fontSize: '16px',
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
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onMenuClose) onMenuClose();
                }}
                style={{
                  fontSize: '20px',
                  color: 'var(--fb-text-light)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Список уведомлений */}
            {loading ? (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--fb-text-light)', fontSize: '13px' }}>
                Загрузка...
              </div>
            ) : !Array.isArray(allNotifications) || allNotifications.length === 0 ? (
              <div
                style={{
                  padding: '30px 20px',
                  textAlign: 'center',
                  color: 'var(--fb-text-light)',
                  fontSize: '13px',
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '10px', color: 'var(--fb-border)' }}>
                  <FaBell />
                </div>
                Нет уведомлений
              </div>
            ) : (
              <>
                {allNotifications.length > 0 && (
                  <div style={{ padding: '10px 15px', borderBottom: '1px solid var(--fb-border)' }}>
                    <button
                      onClick={handleMarkAllAsRead}
                      style={{
                        fontSize: '12px',
                        color: 'var(--fb-blue)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Прочитать все
                    </button>
                  </div>
                )}
                {allNotifications.map((notification) => {
                  const link = getNotificationLink(notification);
                  const content = (
                    <div
                      key={`${notification.type}-${notification.id}`}
                      role="button"
                      tabIndex={0}
                      style={{
                        padding: '12px 15px',
                        borderBottom: '1px solid var(--fb-border)',
                        backgroundColor: notification.is_read ? 'white' : '#f0f8ff',
                        cursor: link ? 'pointer' : 'default',
                      }}
                      onClick={() => handleNotificationClick(notification)}
                      onKeyDown={(e) => { if (link && (e.key === 'Enter' || e.key === ' ')) handleNotificationClick(notification); }}
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
                  return content;
                })}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // Десктопный режим (обычный)
  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={handleBellClick}
        className="header-nav-item"
        style={{
          position: 'relative',
        }}
        title="Уведомления"
        type="button"
      >
        <FaBell className="header-icon" />
        <span className="header-nav-label">Уведомления</span>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '6px',
              backgroundColor: '#f02849',
              color: 'white',
              borderRadius: '10px',
              padding: '1px 5px',
              fontSize: '9px',
              fontWeight: 'bold',
              minWidth: '16px',
              height: '16px',
              textAlign: 'center',
              lineHeight: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="notification-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '400px',
            maxWidth: 'min(90vw, 400px)',
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
          {loading ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--fb-text-light)', fontSize: '13px' }}>
              Загрузка...
            </div>
          ) : !Array.isArray(allNotifications) || allNotifications.length === 0 ? (
            <div
              style={{
                padding: '30px 20px',
                textAlign: 'center',
                color: 'var(--fb-text-light)',
                fontSize: '13px',
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '10px', color: 'var(--fb-border)' }}>
                <FaBell />
              </div>
              Нет уведомлений
            </div>
          ) : (
            allNotifications.map((notification) => {
              const link = getNotificationLink(notification);
              const content = (
                <div
                  key={`${notification.type}-${notification.id}`}
                  role="button"
                  tabIndex={0}
                  style={{
                    padding: '12px 15px',
                    borderBottom: '1px solid var(--fb-border)',
                    backgroundColor: notification.is_read ? 'white' : '#f0f8ff',
                    cursor: link ? 'pointer' : 'default',
                  }}
                  onClick={() => handleNotificationClick(notification)}
                  onKeyDown={(e) => { if (link && (e.key === 'Enter' || e.key === ' ')) handleNotificationClick(notification); }}
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

              return content;
            })
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;