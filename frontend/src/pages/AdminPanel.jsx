import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaTrash, FaUserPlus } from 'react-icons/fa';
import adminService from '../services/adminService';
import Header from '../components/Header';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); 
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [filter]);

    const loadData = async () => {
    try {
        setLoading(true);
        const statsData = await adminService.getStats();
        setStats(statsData);

        let filters = {};
        if (filter === 'approved') filters.is_approved = true;
        if (filter === 'pending') filters.is_approved = false;

        const usersData = await adminService.getUsers(filters);
        setUsers(Array.isArray(usersData) ? usersData : (usersData.results || []));
    } catch (err) {
        setError('Ошибка загрузки данных');
        console.error(err);
    } finally {
        setLoading(false);
    }
    };

  const handleApprove = async (userId) => {
    try {
      await adminService.approveUser(userId);
      loadData();
    } catch (err) {
      alert('Ошибка изменения статуса пользователя');
      console.error(err);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      loadData();
    } catch (err) {
      alert('Ошибка удаления пользователя');
      console.error(err);
    }
  };

  return (
    <>
      <Header />
      <div className="container" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '20px' }}>Панель администратора</h1>

          {/* Статистика */}
          {stats && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '10px',
              marginBottom: '20px'
            }}>
              <div className="card">
                <div className="card-body" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--fb-blue)' }}>
                    {stats.total_users}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--fb-text-light)' }}>
                    Всего пользователей
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--fb-green)' }}>
                    {stats.approved_users}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--fb-text-light)' }}>
                    Одобренные
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--fb-red)' }}>
                    {stats.pending_users}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--fb-text-light)' }}>
                    Ожидают одобрения
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--fb-blue)' }}>
                    {stats.published_posts}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--fb-text-light)' }}>
                    Опубликовано постов
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Управление пользователями */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Управление пользователями</span>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowCreateModal(true)}
              >
                <FaUserPlus /> Создать пользователя
              </button>
            </div>

            <div className="card-body">
              {/* Фильтры */}
              <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                <button 
                  className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilter('all')}
                >
                  Все ({stats?.total_users || 0})
                </button>
                <button 
                  className={`btn btn-sm ${filter === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilter('approved')}
                >
                  Одобренные ({stats?.approved_users || 0})
                </button>
                <button 
                  className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilter('pending')}
                >
                  Ожидают ({stats?.pending_users || 0})
                </button>
              </div>

              {/* Таблица пользователей */}
              {loading ? (
                <div className="loading">Загрузка...</div>
              ) : error ? (
                <div className="error">{error}</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: '13px'
                  }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--fb-border)' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Пользователь</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Одобрен</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Админ</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Активность</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid var(--fb-border)' }}>
                          <td style={{ padding: '10px' }}>
                            <div style={{ fontWeight: 'bold' }}>{user.username}</div>
                            {user.first_name && (
                              <div style={{ fontSize: '11px', color: 'var(--fb-text-light)' }}>
                                {user.first_name} {user.last_name}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '10px' }}>{user.email}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            {user.is_approved ? (
                              <span style={{ color: 'var(--fb-green)' }}>✓</span>
                            ) : (
                              <span style={{ color: 'var(--fb-red)' }}>✗</span>
                            )}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            {user.is_admin_user ? (
                              <span style={{ color: 'var(--fb-blue)' }}>✓</span>
                            ) : (
                              <span style={{ color: 'var(--fb-text-light)' }}>✗</span>
                            )}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '11px' }}>
                              <div>Посты: {user.posts_count || 0}</div>
                              <div>Комменты: {user.comments_count || 0}</div>
                              <div>Лайки: {user.likes_count || 0}</div>
                            </div>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                              <button
                                className={`btn btn-sm ${user.is_approved ? 'btn-secondary' : 'btn-success'}`}
                                onClick={() => handleApprove(user.id)}
                                title={user.is_approved ? 'Отменить одобрение' : 'Одобрить'}
                              >
                                {user.is_approved ? <FaTimes /> : <FaCheck />}
                              </button>
                              
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(user.id)}
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

          {/* Модальное окно создания пользователя */}
          {showCreateModal && (
            <CreateUserModal 
              onClose={() => setShowCreateModal(false)}
              onCreated={loadData}
            />
          )}
        </div>
      </div>
    </>
  );
};

// Компонент модального окна создания пользователя
const CreateUserModal = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    is_approved: true,
    is_admin_user: false,
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

    if (formData.password !== formData.password_confirm) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    try {
      await adminService.createUser(formData);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка создания пользователя');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
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
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '20px' }}>
        <div className="card-header">
          Создать пользователя
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {error && <div className="error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Имя пользователя *</label>
              <input
                type="text"
                name="username"
                className="form-control"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Пароль *</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Подтверждение пароля *</label>
              <input
                type="password"
                name="password_confirm"
                className="form-control"
                value={formData.password_confirm}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Имя</label>
              <input
                type="text"
                name="first_name"
                className="form-control"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Фамилия</label>
              <input
                type="text"
                name="last_name"
                className="form-control"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="is_approved"
                  checked={formData.is_approved}
                  onChange={handleChange}
                  style={{ marginRight: '8px' }}
                />
                <span className="form-label" style={{ marginBottom: 0 }}>
                  Одобрить сразу
                </span>
              </label>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="is_admin_user"
                  checked={formData.is_admin_user}
                  onChange={handleChange}
                  style={{ marginRight: '8px' }}
                />
                <span className="form-label" style={{ marginBottom: 0 }}>
                  Администратор блога
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Создание...' : 'Создать'}
              </button>
              
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onClose}
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;