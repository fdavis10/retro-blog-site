import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import notificationService from '../services/notificationService';

const NotificationsManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAllNotifications();
      setNotifications(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      setError('Ошибка загрузки уведомлений');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить это уведомление?')) return;

    try {
      await notificationService.deleteNotification(id);
      loadNotifications();
    } catch (err) {
      alert('Ошибка удаления уведомления');
      console.error(err);
    }
  };

  const handleToggleActive = async (notification) => {
    try {
      await notificationService.updateNotification(notification.id, {
        ...notification,
        is_active: !notification.is_active,
      });
      loadNotifications();
    } catch (err) {
      alert('Ошибка обновления уведомления');
      console.error(err);
    }
  };

  const loadStats = async (id) => {
    try {
      const data = await notificationService.getNotificationStats(id);
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const getTypeBadge = (type, typeDisplay) => {
    const colors = {
      maintenance: { bg: '#fff3cd', text: '#856404' },
      update: { bg: '#d1ecf1', text: '#0c5460' },
      news: { bg: '#d4edda', text: '#155724' },
      warning: { bg: '#f8d7da', text: '#721c24' },
      info: { bg: '#d1ecf1', text: '#004085' },
    };
    const style = colors[type] || colors.info;
    
    return (
      <span
        style={{
          padding: '3px 8px',
          borderRadius: '3px',
          fontSize: '11px',
          fontWeight: 'bold',
          backgroundColor: style.bg,
          color: style.text,
        }}
      >
        {typeDisplay}
      </span>
    );
  };

  return (
    <div>
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Управление уведомлениями</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setSelectedNotification(null);
              setShowCreateModal(true);
            }}
          >
            <FaPlus /> Создать уведомление
          </button>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--fb-text-light)' }}>
              Нет уведомлений
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--fb-border)' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Заголовок</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Тип</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Статус</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Дата создания</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notification) => (
                    <tr key={notification.id} style={{ borderBottom: '1px solid var(--fb-border)' }}>
                      <td style={{ padding: '10px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                          {notification.title}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'var(--fb-text-light)',
                            maxWidth: '300px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {notification.message}
                        </div>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {getTypeBadge(notification.type, notification.type_display)}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleActive(notification)}
                          className={`btn btn-sm ${notification.is_active ? 'btn-success' : 'btn-secondary'}`}
                          style={{ minWidth: '100px' }}
                        >
                          {notification.is_active ? (
                            <>
                              <FaToggleOn /> Активно
                            </>
                          ) : (
                            <>
                              <FaToggleOff /> Неактивно
                            </>
                          )}
                        </button>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', fontSize: '11px' }}>
                        {new Date(notification.created_at).toLocaleString('ru-RU')}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              setSelectedNotification(notification);
                              loadStats(notification.id);
                            }}
                            title="Статистика"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              setSelectedNotification(notification);
                              setShowCreateModal(true);
                            }}
                            title="Редактировать"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(notification.id)}
                            title="Удалить"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно создания/редактирования */}
      {showCreateModal && (
        <NotificationModal
          notification={selectedNotification}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedNotification(null);
          }}
          onSaved={loadNotifications}
        />
      )}

      {/* Модальное окно статистики */}
      {selectedNotification && !showCreateModal && stats && (
        <StatsModal
          notification={selectedNotification}
          stats={stats}
          onClose={() => {
            setSelectedNotification(null);
            setStats(null);
          }}
        />
      )}
    </div>
  );
};

// Модальное окно создания/редактирования
const NotificationModal = ({ notification, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    title: notification?.title || '',
    message: notification?.message || '',
    type: notification?.type || 'info',
    is_active: notification?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (notification) {
        await notificationService.updateNotification(notification.id, formData);
      } else {
        await notificationService.createNotification(formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка сохранения уведомления');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: '600px', margin: '20px auto' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{notification ? 'Редактировать уведомление' : 'Создать уведомление'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
            ×
          </button>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {error && <div className="error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Заголовок *</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength="200"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Сообщение *</label>
              <textarea
                name="message"
                className="form-control"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Тип уведомления *</label>
              <select name="type" className="form-control" value={formData.type} onChange={handleChange} required>
                <option value="info">Информация</option>
                <option value="news">Новость</option>
                <option value="update">Обновление</option>
                <option value="warning">Предупреждение</option>
                <option value="maintenance">Технические работы</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  style={{ marginRight: '8px' }}
                />
                <span className="form-label" style={{ marginBottom: 0 }}>
                  Активно (показывать пользователям)
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Модальное окно статистики
const StatsModal = ({ notification, stats, onClose }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Статистика уведомления</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
            ×
          </button>
        </div>
        <div className="card-body">
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ marginBottom: '10px' }}>{notification.title}</h4>
            <div style={{ fontSize: '13px', color: 'var(--fb-text-light)' }}>{notification.message}</div>
          </div>

          <hr />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'var(--fb-hover)', borderRadius: '5px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--fb-blue)' }}>
                {stats.total_interactions}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--fb-text-light)' }}>Взаимодействий</div>
            </div>

            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'var(--fb-hover)', borderRadius: '5px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--fb-green)' }}>
                {stats.read_count}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--fb-text-light)' }}>Прочитано</div>
            </div>

            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'var(--fb-hover)', borderRadius: '5px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--fb-red)' }}>
                {stats.dismissed_count}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--fb-text-light)' }}>Закрыто</div>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%' }}>
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsManagement;