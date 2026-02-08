import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { FaBars, FaTimes, FaHome, FaUser, FaUserFriends, FaPlus, FaCog, FaSignOutAlt, FaEnvelope, FaBell, FaSearch } from 'react-icons/fa';

const Header = () => {
  const { user, logout, isAdmin, isSuperuser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // На мобильных устройствах перенаправляем на страницу поиска
    if (isMobile) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      return;
    }
    
    setSearchLoading(true);
    try {
      const { blogService } = await import('../services/blogService');
      const results = await blogService.search(searchQuery);
      setSearchResults(results);
      setShowSearch(true);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const closeSearch = () => {
    setShowSearch(false);
    setSearchResults(null);
    setSearchQuery('');
  };

  // Базовые ссылки без поиска (для десктопа)
  const baseNavLinks = (
    <>
      <Link to="/" className="header-nav-item" title="Главная" onClick={() => setMenuOpen(false)}>
        <FaHome className="header-icon" />
        <span className="header-nav-label">Главная</span>
      </Link>
      
      {user?.username && (
        <Link to={`/profile/${user.username}`} className="header-nav-item" title="Профиль" onClick={() => setMenuOpen(false)}>
          <FaUser className="header-icon" />
          <span className="header-nav-label">Профиль</span>
        </Link>
      )}

      <Link to="/friends" className="header-nav-item" title="Друзья" onClick={() => setMenuOpen(false)}>
        <FaUserFriends className="header-icon" />
        <span className="header-nav-label">Друзья</span>
      </Link>

      <Link to="/messages" className="header-nav-item" title="Сообщения" onClick={() => setMenuOpen(false)}>
        <FaEnvelope className="header-icon" />
        <span className="header-nav-label">Сообщения</span>
      </Link>

      <Link to="/create-post" className="header-nav-item" title="Создать пост" onClick={() => setMenuOpen(false)}>
        <FaPlus className="header-icon header-icon-plus" />
        <span className="header-nav-label">Создать пост</span>
      </Link>

      {isSuperuser && (
        <Link to="/admin" className="header-nav-item" title="Админка" onClick={() => setMenuOpen(false)}>
          <FaCog className="header-icon" />
          <span className="header-nav-label">Админка</span>
        </Link>
      )}
    </>
  );

  // Ссылки для мобильной версии (с поиском)
  const navLinksBeforeLogout = (
    <>
      {baseNavLinks}
      <Link to="/search" className="header-nav-item" title="Поиск" onClick={() => setMenuOpen(false)}>
        <FaSearch className="header-icon" />
        <span className="header-nav-label">Поиск</span>
      </Link>
    </>
  );

  const logoutButton = (
    <button 
      onClick={handleLogout} 
      className="header-nav-item header-nav-btn" 
      title="Выход"
      type="button"
    >
      <FaSignOutAlt className="header-icon" />
      <span className="header-nav-label">Выход</span>
    </button>
  );

  // Пункт меню "Уведомления" для мобильной версии
  const notificationMenuItem = (
    <NotificationBell mobileMode={true} onMenuClose={() => setMenuOpen(false)} />
  );

  // Десктопная версия: уведомления перед кнопкой выхода (без поиска, т.к. есть поле поиска)
  const navLinksWithBell = (
    <>
      {baseNavLinks}
      <div className="header-nav-item-wrapper">
        <NotificationBell />
      </div>
      {logoutButton}
    </>
  );

  // Мобильное меню с уведомлениями
  const mobileNavLinks = (
    <>
      {navLinksBeforeLogout}
      {notificationMenuItem}
      {logoutButton}
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

        {/* Поиск (только для десктопа) */}
        {user && !isMobile && (
          <form onSubmit={handleSearch} className="header-search" style={{ position: 'relative', marginRight: '10px' }}>
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ padding: '8px 35px 8px 12px', borderRadius: '0', border: '1px solid var(--fb-border)', width: '250px' }}
            />
            <button
              type="submit"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--fb-text-light)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <FaSearch />
            </button>
          </form>
        )}

        {/* Десктоп: навбар с иконками + колокольчик */}
        <nav className="header-nav header-nav-desktop">
          {user && navLinksWithBell}
        </nav>

        {/* Мобильный: бургер */}
        {user && (
          <div className="header-mobile-actions">
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
            {mobileNavLinks}
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

      {/* Результаты поиска */}
      {showSearch && searchResults && (
        <div 
          className="header-search-results"
          style={{
            position: 'fixed',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '600px',
            backgroundColor: 'white',
            border: '1px solid var(--fb-border)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            maxHeight: '70vh',
            overflowY: 'auto',
            padding: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Результаты поиска</h3>
            <button onClick={closeSearch} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
          </div>

          {searchResults.posts && searchResults.posts.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--fb-text-light)' }}>Посты ({searchResults.posts.length})</h4>
              {searchResults.posts.map(post => (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  onClick={closeSearch}
                  style={{
                    display: 'block',
                    padding: '10px',
                    marginBottom: '8px',
                    border: '1px solid var(--fb-border)',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{post.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--fb-text-light)' }}>
                    от {post.author.username}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {searchResults.categories && searchResults.categories.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--fb-text-light)' }}>Рубрики ({searchResults.categories.length})</h4>
              {searchResults.categories.map(cat => (
                <div
                  key={cat.id}
                  style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    marginRight: '8px',
                    marginBottom: '8px',
                    backgroundColor: cat.color,
                    color: cat.color === '#F7B928' || cat.color === '#45BD62' ? '#000' : '#fff',
                    borderRadius: '20px',
                    fontSize: '13px'
                  }}
                >
                  {cat.name}
                </div>
              ))}
            </div>
          )}

          {searchResults.comments && searchResults.comments.length > 0 && (
            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--fb-text-light)' }}>Комментарии ({searchResults.comments.length})</h4>
              {searchResults.comments.map(comment => (
                <Link
                  key={comment.id}
                  to={`/post/${comment.post.id}`}
                  onClick={closeSearch}
                  style={{
                    display: 'block',
                    padding: '10px',
                    marginBottom: '8px',
                    border: '1px solid var(--fb-border)',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                    <strong>{comment.author.username}</strong> в посте "{comment.post.title}"
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--fb-text-light)' }}>{comment.content.substring(0, 100)}...</div>
                </Link>
              ))}
            </div>
          )}

          {(!searchResults.posts || searchResults.posts.length === 0) &&
           (!searchResults.categories || searchResults.categories.length === 0) &&
           (!searchResults.comments || searchResults.comments.length === 0) && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--fb-text-light)' }}>
              Ничего не найдено
            </div>
          )}
        </div>
      )}

      {showSearch && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 999
          }}
          onClick={closeSearch}
        />
      )}
    </div>
  );
};

export default Header;
