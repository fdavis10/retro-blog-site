import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaUsers, FaComments, FaHeart, FaShare, FaArrowRight, FaEdit, FaTags,
  FaUserPlus, FaLock, FaGlobe, FaImage, FaFileAlt, FaClock, FaCheckCircle
} from 'react-icons/fa';
import api from '../services/api';

const Welcome = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [fadeIn, setFadeIn] = useState(false);
  const [stats, setStats] = useState({
    total_users: 0,
    published_posts: 0,
    total_comments: 0,
    total_likes: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    // Если пользователь авторизован, перенаправляем на главную
    if (!loading && user) {
      navigate('/');
    }
    // Анимации появления
    setTimeout(() => setFadeIn(true), 100);
    
    // Загружаем статистику (публичный эндпоинт)
    loadStats();
  }, [user, loading, navigate]);

  const loadStats = async () => {
    try {
      // Пытаемся получить статистику, если эндпоинт доступен
      // Если нет - используем дефолтные значения
      const response = await api.get('/blog/public-stats/').catch(() => null);
      if (response && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      // Используем дефолтные значения
      console.log('Stats not available');
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(#4e69a2, #3b5998)'
      }}>
        <div className="loading" style={{ color: 'white' }}>Загрузка...</div>
      </div>
    );
  }

  if (user) {
    return null; // Пока идет редирект
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(#4e69a2, #3b5998)',
      fontFamily: "'Lucida Grande', 'Segoe UI', Tahoma, Verdana, Arial, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        .welcome-card {
          animation: ${fadeIn ? 'fadeIn 0.8s ease-out' : 'none'};
        }
        .welcome-feature {
          animation: ${fadeIn ? 'slideIn 0.6s ease-out' : 'none'};
        }
        @media (max-width: 768px) {
          .welcome-main-grid {
            grid-template-columns: 1fr !important;
          }
          .welcome-features-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .welcome-info-grid {
            grid-template-columns: 1fr !important;
          }
          .welcome-stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>

      <div style={{
        maxWidth: '980px',
        margin: '0 auto',
        padding: '20px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Верхний блок - Заголовок и кнопки */}
        <div className="welcome-card" style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '30px',
          borderRadius: '0',
          marginBottom: '20px',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '42px',
            fontWeight: 'bold',
            marginBottom: '15px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            letterSpacing: '-1px',
            color: 'white'
          }}>
            myposts
          </h1>
          <p style={{
            fontSize: '18px',
            marginBottom: '25px',
            opacity: 0.95,
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            color: 'white'
          }}>
            Социальная сеть для обмена мыслями, идеями и общения с друзьями
          </p>
          
          {/* Кнопки действий */}
          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'linear-gradient(#56a03a, #42b72a)',
                border: '1px solid #3d8228',
                color: 'white',
                padding: '10px 25px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderRadius: '0',
                textShadow: '0 -1px 0 rgba(0, 0, 0, 0.4)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'linear-gradient(#42b72a, #56a03a)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'linear-gradient(#56a03a, #42b72a)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
              }}
            >
              Войти <FaArrowRight />
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '10px 25px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderRadius: '0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
              }}
            >
              Регистрация <FaUserPlus />
            </button>
          </div>
        </div>

        {/* Статистика */}
        <div className="welcome-card" style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '25px',
          borderRadius: '0',
          marginBottom: '20px',
          color: 'white'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '20px',
            textAlign: 'center',
            color: 'white',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>
            Наше сообщество растет
          </h2>
          <div className="welcome-stats-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '15px',
            textAlign: 'center'
          }}>
            {[
              { icon: FaUsers, label: 'Пользователей', value: stats.total_users || '—' },
              { icon: FaEdit, label: 'Публикаций', value: stats.published_posts || '—' },
              { icon: FaComments, label: 'Комментариев', value: stats.total_comments || '—' },
              { icon: FaHeart, label: 'Лайков', value: stats.total_likes || '—' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} style={{
                  padding: '15px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0'
                }}>
                  <Icon style={{ fontSize: '28px', marginBottom: '10px', color: 'white' }} />
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: '5px',
                    color: 'white'
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    opacity: 0.9,
                    color: 'white'
                  }}>
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Основные функции */}
        <div className="welcome-card" style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '30px',
          borderRadius: '0',
          marginBottom: '20px',
          color: 'white'
        }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: 'bold',
            marginBottom: '25px',
            color: 'white',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>
            Что вы можете делать на myposts?
          </h2>
          <div className="welcome-features-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px'
          }}>
            {[
              {
                icon: FaEdit,
                title: 'Создавайте посты',
                description: 'Делитесь своими мыслями, идеями и опытом. Используйте форматирование текста, добавляйте изображения и вложения. Ваши посты увидят все пользователи сообщества.'
              },
              {
                icon: FaUsers,
                title: 'Находите друзей',
                description: 'Отправляйте запросы на дружбу, общайтесь с единомышленниками. Стройте свою социальную сеть и расширяйте круг общения.'
              },
              {
                icon: FaComments,
                title: 'Общайтесь',
                description: 'Комментируйте посты, обменивайтесь личными сообщениями. Участвуйте в обсуждениях и делитесь мнениями с сообществом.'
              },
              {
                icon: FaTags,
                title: 'Организуйте контент',
                description: 'Используйте рубрики для категоризации ваших постов. Создавайте несколько рубрик для одного поста через запятую.'
              },
              {
                icon: FaHeart,
                title: 'Выражайте мнение',
                description: 'Ставьте лайки понравившимся постам. Показывайте свою поддержку авторам и их контенту.'
              },
              {
                icon: FaImage,
                title: 'Делитесь медиа',
                description: 'Загружайте изображения к вашим постам. Добавляйте аудиофайлы и документы для более полного раскрытия темы.'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="welcome-feature"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '20px',
                    borderRadius: '0',
                    transition: 'all 0.3s',
                    animationDelay: `${index * 0.1}s`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <Icon style={{ fontSize: '24px', color: 'white', flexShrink: 0 }} />
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      margin: 0,
                      color: 'white'
                    }}>
                      {feature.title}
                    </h3>
                  </div>
                  <p style={{
                    fontSize: '13px',
                    lineHeight: '1.5',
                    margin: 0,
                    color: 'white',
                    opacity: 0.9
                  }}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Почему мы интересны */}
        <div className="welcome-card" style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '30px',
          borderRadius: '0',
          marginBottom: '20px',
          color: 'white'
        }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: 'bold',
            marginBottom: '25px',
            color: 'white',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>
            Почему стоит присоединиться?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px'
          }}>
            {[
              {
                icon: FaLock,
                title: 'Безопасность',
                description: 'Модерация контента и проверка пользователей. Только одобренные пользователи могут создавать посты и общаться.'
              },
              {
                icon: FaGlobe,
                title: 'Активное сообщество',
                description: 'Присоединяйтесь к растущему сообществу единомышленников. Обменивайтесь опытом и находите новых друзей.'
              },
              {
                icon: FaCheckCircle,
                title: 'Простота использования',
                description: 'Интуитивный интерфейс в стиле классических социальных сетей. Все функции доступны и понятны с первого взгляда.'
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} style={{
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '0'
                }}>
                  <Icon style={{ fontSize: '32px', marginBottom: '15px', color: 'white' }} />
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    color: 'white'
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    lineHeight: '1.5',
                    color: 'white',
                    opacity: 0.9,
                    margin: 0
                  }}>
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Как это работает */}
        <div className="welcome-card" style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '30px',
          borderRadius: '0',
          marginBottom: '20px',
          color: 'white'
        }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: 'bold',
            marginBottom: '25px',
            color: 'white',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>
            Как это работает?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            textAlign: 'center'
          }}>
            {[
              { step: '1', icon: FaUserPlus, text: 'Подайте заявку на регистрацию' },
              { step: '2', icon: FaCheckCircle, text: 'Дождитесь одобрения администратора' },
              { step: '3', icon: FaEdit, text: 'Создавайте посты и общайтесь' },
              { step: '4', icon: FaUsers, text: 'Находите друзей и расширяйте сеть' }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} style={{
                  padding: '20px 15px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '0'
                }}>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    color: 'white'
                  }}>
                    {item.step}
                  </div>
                  <Icon style={{ fontSize: '28px', marginBottom: '12px', color: 'white' }} />
                  <div style={{
                    fontSize: '13px',
                    lineHeight: '1.4',
                    color: 'white',
                    opacity: 0.9
                  }}>
                    {item.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Призыв к действию */}
        <div className="welcome-card" style={{
          background: 'rgba(255, 255, 255, 0.15)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          padding: '40px 30px',
          borderRadius: '0',
          textAlign: 'center',
          color: 'white'
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Готовы начать?
          </h2>
          <p style={{
            fontSize: '16px',
            marginBottom: '30px',
            opacity: 0.95,
            color: 'white'
          }}>
            Присоединяйтесь к нашему сообществу прямо сейчас и начните делиться своими мыслями с друзьями!
          </p>
          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                background: 'linear-gradient(#56a03a, #42b72a)',
                border: '1px solid #3d8228',
                color: 'white',
                padding: '12px 35px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderRadius: '0',
                textShadow: '0 -1px 0 rgba(0, 0, 0, 0.4)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'linear-gradient(#42b72a, #56a03a)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'linear-gradient(#56a03a, #42b72a)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
              }}
            >
              Подать заявку <FaUserPlus />
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '12px 35px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderRadius: '0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
              }}
            >
              Уже есть аккаунт? Войти <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
