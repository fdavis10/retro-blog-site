import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout, isAdmin, isSuperuser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="header">
      <div className="header-content">
        <Link to="/" className="header-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/logo.svg" 
            alt="vld.blog" 
            style={{ height: '35px', width: 'auto' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'inline';
            }}
          />
          <span style={{ display: 'none' }}>vld.blog</span>
        </Link>

        <nav className="header-nav">
          {user && (
            <>
              <Link to="/" className="header-link">
                Главная
              </Link>
              
              <Link to={`/profile/${user.username}`} className="header-link">
                Профиль
              </Link>

              {/* Кнопка "Создать пост" для админов блога */}
              {isAdmin && (
                <Link to="/create-post" className="header-link">
                  Создать пост
                </Link>
              )}

              {/* Кнопка "Админка" для суперпользователей */}
              {isSuperuser && (
                <Link to="/admin" className="header-link">
                  Админка
                </Link>
              )}

              <button onClick={handleLogout} className="header-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                Выход
              </button>
            </>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Header;