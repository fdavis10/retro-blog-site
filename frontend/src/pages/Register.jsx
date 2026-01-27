import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { FaCheckCircle } from 'react-icons/fa';

const Register = () => {
  const [step, setStep] = useState(1); // 1 = форма, 2 = ввод кода, 3 = успех
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
  const [verificationCode, setVerificationCode] = useState('');
  const [requestId, setRequestId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
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
      const response = await authService.register(formData);
      setRequestId(response.request_id);
      setUserEmail(response.email);
      setStep(2); // Переходим к вводу кода
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData) {
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

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.verifyEmail(requestId, verificationCode);
      setStep(3); // Переходим к экрану успеха
    } catch (err) {
      setError(err.response?.data?.error || 'Неверный код подтверждения');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setResendLoading(true);

    try {
      await authService.resendVerificationCode(requestId);
      alert('Новый код отправлен на ваш email!');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка отправки кода');
    } finally {
      setResendLoading(false);
    }
  };

  // Экран успешной верификации
  if (step === 3) {
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
            <div style={{ fontSize: '48px', marginBottom: '20px', color: 'var(--fb-green)' }}>
              <FaCheckCircle />
            </div>
            <h2 style={{ marginBottom: '15px' }}>Email подтвержден!</h2>
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

  // Экран ввода кода верификации
  if (step === 2) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(#4e69a2, #3b5998)'
      }}>
        <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '20px' }}>
          <div className="card-header" style={{ textAlign: 'center', fontSize: '18px' }}>
            Подтверждение email
          </div>
          
          <div className="card-body">
            <p style={{ marginBottom: '20px', fontSize: '13px', color: 'var(--fb-text-light)', textAlign: 'center' }}>
              Мы отправили 6-значный код подтверждения на:<br />
              <strong>{userEmail}</strong>
            </p>

            <form onSubmit={handleVerifyCode}>
              {error && (
                <div className="error" style={{ marginBottom: '15px' }}>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Код подтверждения</label>
                <input
                  type="text"
                  className="form-control"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Введите 6-значный код"
                  required
                  autoFocus
                  style={{ fontSize: '20px', textAlign: 'center', letterSpacing: '5px' }}
                  maxLength="6"
                />
                <div style={{ fontSize: '11px', color: 'var(--fb-text-light)', marginTop: '5px' }}>
                  Код действителен в течение 15 минут
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? 'Проверка...' : 'Подтвердить'}
              </button>
            </form>

            <div style={{ 
              marginTop: '20px', 
              textAlign: 'center',
              fontSize: '13px'
            }}>
              Не получили код?{' '}
              <button
                onClick={handleResendCode}
                disabled={resendLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--fb-blue)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                {resendLoading ? 'Отправка...' : 'Отправить снова'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Экран формы регистрации
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
            Заполните анкету ниже. На ваш email будет отправлен код подтверждения.
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
              <div style={{ fontSize: '11px', color: 'var(--fb-text-light)', marginTop: '5px' }}>
                На этот адрес будет отправлен код подтверждения
              </div>
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
              {loading ? 'Отправка...' : 'Продолжить'}
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