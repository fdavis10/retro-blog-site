import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    reason: '',
    age: '',
    occupation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register(formData);
      setSuccess(true);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData) {
        // Обработка ошибок валидации
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return `${field}: ${messages.join(', ')}`;
            }
            return messages;
          })
          .join('\n');
        setError(errorMessages);
      } else {
        setError('Ошибка отправки заявки');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(#4e69a2, #3b5998)'
      }}>
        <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '20px' }}>
          <div className="card-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
            <h2 style={{ marginBottom: '15px' }}>Заявка отправлена!</h2>
            <p style={{ marginBottom: '20px', color: 'var(--fb-text-light)' }}>
              Ваша заявка на регистрацию успешно отправлена администратору. 
              Ожидайте одобрения. Вы получите уведомление на указанный email.
            </p>
            <Link to="/login" className="btn btn-primary">
              Вернуться к входу
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(#4e69a2, #3b5998)',
      padding: '20px 0'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px', margin: '20px' }}>
        <div className="card-header" style={{ textAlign: 'center', fontSize: '18px' }}>
          Заявка на регистрацию
        </div>
        
        <div className="card-body">
          <p style={{ marginBottom: '20px', fontSize: '13px', color: 'var(--fb-text-light)' }}>
            Заполните анкету ниже. Администратор рассмотрит вашу заявку и примет решение о регистрации.
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error" style={{ marginBottom: '15px', whiteSpace: 'pre-line' }}>
                {error}
              </div>
            )}

            {/* Основные данные */}
            <div className="form-group">
              <label className="form-label">Имя пользователя *</label>
              <input
                type="text"
                name="username"
                className="form-control"
                value={formData.username}
                onChange={handleChange}
                required
                autoFocus
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
              <label className="form-label">Имя *</label>
              <input
                type="text"
                name="first_name"
                className="form-control"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Фамилия *</label>
              <input
                type="text"
                name="last_name"
                className="form-control"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Почему вы хотите присоединиться к блогу? *</label>
              <textarea
                name="reason"
                className="form-control"
                value={formData.reason}
                onChange={handleChange}
                rows="4"
                placeholder="Расскажите немного о себе и почему хотите стать частью нашего сообщества..."
                required
                maxLength="500"
              />
              <div style={{ fontSize: '11px', color: 'var(--fb-text-light)', marginTop: '5px' }}>
                {formData.reason.length}/500 символов
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Возраст</label>
              <input
                type="number"
                name="age"
                className="form-control"
                value={formData.age}
                onChange={handleChange}
                min="13"
                max="120"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Род деятельности</label>
              <input
                type="text"
                name="occupation"
                className="form-control"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="Студент, Разработчик, Дизайнер и т.д."
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? 'Отправка...' : 'Отправить заявку'}
            </button>
          </form>

          <div style={{ 
            marginTop: '20px', 
            textAlign: 'center',
            fontSize: '13px'
          }}>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;