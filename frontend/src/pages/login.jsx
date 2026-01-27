import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Ошибка входа. Проверьте учетные данные.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(#4e69a2, #3b5998)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '20px' }}>
        <div className="card-header" style={{ textAlign: 'center', fontSize: '18px' }}>
          myposts
        </div>
        
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error" style={{ marginBottom: '15px' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Имя пользователя</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Пароль</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div style={{ 
            marginTop: '15px', 
            padding: '12px', 
            backgroundColor: '#f6f7f8', 
            borderRadius: '3px',
            fontSize: '12px',
            color: 'var(--fb-text-light)',
            textAlign: 'center'
          }}>
            <strong>Нет аккаунта?</strong> <Link to="/register" style={{ fontWeight: 'bold' }}>Подать заявку на регистрацию</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;