import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { FaBars, FaTimes, FaHome, FaUser, FaUserFriends, FaPlus, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const { user, logout, isAdmin, isSuperuser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const navLinks = (
    <>
      <Link to="/" className="header-nav-item" title="Главная" onClick={() => setMenuOpen(false)}>
        <FaHome className="header-icon" />
        <span className="header-nav-label">Главная</span>
      </Link>
      
      <Link to={`/profile/${user?.username}`} className="header-nav-item" title="Профиль" onClick={() => setMenuOpen(false)}>
        <FaUser className="header-icon" />
        <span className="header-nav-label">Профиль</span>
      </Link>

      <Link to="/friends" className="header-nav-item" title="Друзья" onClick={() => setMenuOpen(false)}>
        <FaUserFriends className="header-icon" />
        <span className="header-nav-label">Друзья</span>
      </Link>

      {isAdmin && (
        <Link to="/create-post" className="header-nav-item" title="Создать пост" onClick={() => setMenuOpen(false)}>
          <FaPlus className="header-icon header-icon-plus" />
          <span className="header-nav-label">Создать пост</span>
        </Link>
      )}

      {isSuperuser && (
        <Link to="/admin" className="header-nav-item" title="Админка" onClick={() => setMenuOpen(false)}>
          <FaCog className="header-icon" />
          <span className="header-nav-label">Админка</span>
        </Link>
      )}

      <button 
        onClick={handleLogout} 
        className="header-nav-item header-nav-btn" 
        title="Выход"
        type="button"
      >
        <FaSignOutAlt className="header-icon" />
        <span className="header-nav-label">Выход</span>
      </button>
    </>
  );

  const navLinksWithBell = (
    <>
      {navLinks}
      <div className="header-nav-item-wrapper">
        <NotificationBell />
      </div>
    </>
  );

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

        {/* Десктоп: навбар с иконками + колокольчик */}
        <nav className="header-nav header-nav-desktop">
          {user && navLinksWithBell}
        </nav>

        {/* Мобильный: колокольчик + бургер */}
        {user && (
          <div className="header-mobile-actions">
            <div className="header-bell-mobile">
              <NotificationBell />
            </div>
            <button
              type="button"
              className="header-burger"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
          </div>
        )}
      </div>

      {/* Мобильное меню (бургер) */}
      {user && (
        <div 
          className={`header-burger-menu ${menuOpen ? 'header-burger-menu-open' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <nav className="header-burger-nav">
            {navLinks}
          </nav>
        </div>
      )}

      {/* Оверлей для мобильного меню */}
      {menuOpen && (
        <div 
          className="header-overlay" 
          onClick={() => setMenuOpen(false)} 
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Header;
