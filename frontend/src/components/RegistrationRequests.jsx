import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaTrash, FaEye } from 'react-icons/fa';
import adminService from '../services/adminService';

const RegistrationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectComment, setRejectComment] = useState('');

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === 'all' ? null : filter;
      const data = await adminService.getRegistrationRequests(statusFilter);
      setRequests(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      setError('Ошибка загрузки заявок');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Одобрить эту заявку и создать пользователя?')) return;

    try {
      await adminService.approveRegistrationRequest(id);
      alert('Заявка одобрена! Пользователь создан.');
      loadRequests();
      setSelectedRequest(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка одобрения заявки');
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await adminService.rejectRegistrationRequest(id, rejectComment);
      alert('Заявка отклонена');
      loadRequests();
      setSelectedRequest(null);
      setRejectComment('');
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка отклонения заявки');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить эту заявку?')) return;

    try {
      await adminService.deleteRegistrationRequest(id);
      loadRequests();
      setSelectedRequest(null);
    } catch (err) {
      alert('Ошибка удаления заявки');
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: { bg: '#fff3cd', text: '#856404', label: 'Ожидает' },
      approved: { bg: '#d4edda', text: '#155724', label: 'Одобрена' },
      rejected: { bg: '#f8d7da', text: '#721c24', label: 'Отклонена' },
    };
    const style = colors[status] || colors.pending;
    return (
      <span style={{
        padding: '3px 8px',
        borderRadius: '3px',
        fontSize: '11px',
        fontWeight: 'bold',
        backgroundColor: style.bg,
        color: style.text,
      }}>
        {style.label}
      </span>
    );
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          Заявки на регистрацию
        </div>

        <div className="card-body">
          {/* Фильтры */}
          <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
            <button 
              className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('pending')}
            >
              Ожидают
            </button>
            <button 
              className={`btn btn-sm ${filter === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('approved')}
            >
              Одобренные
            </button>
            <button 
              className={`btn btn-sm ${filter === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('rejected')}
            >
              Отклоненные
            </button>
            <button 
              className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('all')}
            >
              Все
            </button>
          </div>

          {/* Таблица заявок */}
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--fb-text-light)' }}>
              Нет заявок
            </div>
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
                    <th style={{ padding: '10px', textAlign: 'left' }}>Имя</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Статус</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Дата</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(request => (
                    <tr key={request.id} style={{ borderBottom: '1px solid var(--fb-border)' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{request.username}</td>
                      <td style={{ padding: '10px' }}>{request.first_name} {request.last_name}</td>
                      <td style={{ padding: '10px' }}>{request.email}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {getStatusBadge(request.status)}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', fontSize: '11px' }}>
                        {new Date(request.created_at).toLocaleDateString('ru-RU')}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setSelectedRequest(request)}
                          title="Просмотреть"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно деталей заявки */}
      {selectedRequest && (
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
          padding: '20px',
          overflowY: 'auto',
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', margin: '20px auto' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Заявка #{selectedRequest.id}</span>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong>Статус:</strong>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Дата подачи:</strong> {new Date(selectedRequest.created_at).toLocaleString('ru-RU')}
                </div>
              </div>

              <hr />

              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ marginBottom: '10px' }}>Данные пользователя</h4>
                <div style={{ marginBottom: '5px' }}><strong>Username:</strong> {selectedRequest.username}</div>
                <div style={{ marginBottom: '5px' }}><strong>Email:</strong> {selectedRequest.email}</div>
                <div style={{ marginBottom: '5px' }}><strong>Имя:</strong> {selectedRequest.first_name}</div>
                <div style={{ marginBottom: '5px' }}><strong>Фамилия:</strong> {selectedRequest.last_name}</div>
                {selectedRequest.age && (
                  <div style={{ marginBottom: '5px' }}><strong>Возраст:</strong> {selectedRequest.age}</div>
                )}
                {selectedRequest.occupation && (
                  <div style={{ marginBottom: '5px' }}><strong>Род деятельности:</strong> {selectedRequest.occupation}</div>
                )}
              </div>

              <hr />

              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ marginBottom: '10px' }}>Почему хочет присоединиться?</h4>
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: 'var(--fb-hover)', 
                  borderRadius: '3px',
                  fontSize: '13px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedRequest.reason}
                </div>
              </div>

              {selectedRequest.status === 'rejected' && selectedRequest.admin_comment && (
                <>
                  <hr />
                  <div style={{ marginBottom: '15px' }}>
                    <h4 style={{ marginBottom: '10px' }}>Комментарий администратора:</h4>
                    <div style={{ 
                      padding: '10px', 
                      backgroundColor: '#f8d7da', 
                      borderRadius: '3px',
                      fontSize: '13px'
                    }}>
                      {selectedRequest.admin_comment}
                    </div>
                  </div>
                </>
              )}

              {selectedRequest.status === 'pending' && (
                <>
                  <hr />
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                      <label className="form-label">Комментарий (для отклонения)</label>
                      <textarea
                        className="form-control"
                        value={rejectComment}
                        onChange={(e) => setRejectComment(e.target.value)}
                        rows="3"
                        placeholder="Причина отклонения (опционально)"
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        className="btn btn-success"
                        onClick={() => handleApprove(selectedRequest.id)}
                      >
                        <FaCheck /> Одобрить
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleReject(selectedRequest.id)}
                      >
                        <FaTimes /> Отклонить
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setSelectedRequest(null)}
                        style={{ marginLeft: 'auto' }}
                      >
                        Закрыть
                      </button>
                    </div>
                  </div>
                </>
              )}

              {selectedRequest.status !== 'pending' && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete(selectedRequest.id)}
                  >
                    <FaTrash /> Удалить заявку
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setSelectedRequest(null)}
                    style={{ marginLeft: 'auto' }}
                  >
                    Закрыть
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationRequests;