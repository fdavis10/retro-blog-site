import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      backgroundColor: 'var(--fb-bg)',
      borderTop: '1px solid var(--fb-border)',
      marginTop: 'auto',
      padding: '30px 0',
      fontSize: '12px',
      color: 'var(--fb-text-light)'
    }}>
      <div className="container">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '30px',
          marginBottom: '20px'
        }}>
          {/* О проекте */}
          <div>
            <h4 style={{ 
              fontSize: '13px', 
              fontWeight: 'bold', 
              marginBottom: '10px',
              color: 'var(--fb-text)'
            }}>
              О блоге
            </h4>
            <p style={{ lineHeight: '1.6', marginBottom: '10px' }}>
              Личный блог в стиле классического Facebook 2010. 
              Делитесь мыслями, общайтесь с друзьями и находите единомышленников.
            </p>
          </div>

          {/* Навигация */}
          <div>
            <h4 style={{ 
              fontSize: '13px', 
              fontWeight: 'bold', 
              marginBottom: '10px',
              color: 'var(--fb-text)'
            }}>
              Навигация
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                <Link to="/" style={{ color: 'var(--fb-blue)', textDecoration: 'none' }}>
                  Главная
                </Link>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Link to="/register" style={{ color: 'var(--fb-blue)', textDecoration: 'none' }}>
                  Регистрация
                </Link>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Link to="/login" style={{ color: 'var(--fb-blue)', textDecoration: 'none' }}>
                  Вход
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h4 style={{ 
              fontSize: '13px', 
              fontWeight: 'bold', 
              marginBottom: '10px',
              color: 'var(--fb-text)'
            }}>
              Контакты
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                📧 Email: waiting
              </li>
              <li style={{ marginBottom: '8px' }}>
                💬 Telegram: @vladimir_telniy
              </li>
            </ul>
          </div>

          {/* Информация */}
          <div>
            <h4 style={{ 
              fontSize: '13px', 
              fontWeight: 'bold', 
              marginBottom: '10px',
              color: 'var(--fb-text)'
            }}>
              Информация
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                Версия: 1.0
              </li>
              <li style={{ marginBottom: '8px' }}>
                Django + React
              </li>
              <li style={{ marginBottom: '8px' }}>
                Retro Style 2010
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ 
          textAlign: 'center', 
          paddingTop: '20px', 
          borderTop: '1px solid var(--fb-border)',
          color: 'var(--fb-text-light)'
        }}>
          © {currentYear} vld.blog. Все права защищены. Сделано с энтузизмом.
        </div>
      </div>
    </footer>
  );
};

export default Footer;