import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaMapMarkerAlt, FaLink, FaBirthdayCake, FaHeart, FaMusic, FaFilm, FaBook, FaEnvelope, FaCircle, FaThumbsUp } from 'react-icons/fa';
import { authService } from '../services/authService';
import { blogService } from '../services/blogService';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Avatar from '../components/Avatar';
import FriendshipButton from '../components/FriendshipButton';
import PostCard from '../components/PostCard';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'liked'
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    loadProfile();
    loadUserPosts();
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await authService.getUserProfile(username);
      setUser(data);
    } catch (err) {
      setError('Ошибка загрузки профиля');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async () => {
    try {
      setLoadingPosts(true);
      const posts = await blogService.getUserPosts(username);
      setUserPosts(Array.isArray(posts) ? posts : (posts.results || []));
    } catch (err) {
      console.error('Error loading user posts:', err);
      setUserPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadLikedPosts = async () => {
    try {
      setLoadingPosts(true);
      const posts = await blogService.getUserLikedPosts(username);
      setLikedPosts(Array.isArray(posts) ? posts : (posts.results || []));
    } catch (err) {
      console.error('Error loading liked posts:', err);
      setLikedPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'liked' && likedPosts.length === 0) {
      loadLikedPosts();
    }
  };

  const isOwnProfile = currentUser?.username === username;

  // Функция для отображения выбора из списка
  const getChoiceDisplay = (value, choices) => {
    if (!value) return null;
    const choice = choices.find(c => c[0] === value);
    return choice ? choice[1] : value;
  };

  // Вычисляем информацию о последнем визите
  const getLastSeenInfo = () => {
    if (!user) return null;
    
    // Если пользователь онлайн
    if (user.is_online) {
      return {
        online: true,
        text: 'В сети'
      };
    }
    
    // Если есть информация о last_seen
    if (user.last_seen) {
      const lastSeen = new Date(user.last_seen);
      const now = new Date();
      const diffMs = now - lastSeen;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) {
        return {
          online: false,
          text: 'только что'
        };
      } else if (diffMins < 60) {
        return {
          online: false,
          text: `${diffMins} ${diffMins === 1 ? 'минуту' : diffMins < 5 ? 'минуты' : 'минут'} назад`
        };
      } else if (diffHours < 24) {
        return {
          online: false,
          text: `${diffHours} ${diffHours === 1 ? 'час' : diffHours < 5 ? 'часа' : 'часов'} назад`
        };
      } else if (diffDays < 7) {
        return {
          online: false,
          text: `${diffDays} ${diffDays === 1 ? 'день' : diffDays < 5 ? 'дня' : 'дней'} назад`
        };
      } else {
        return {
          online: false,
          text: lastSeen.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
        };
      }
    }
    
    return null;
  };

  const lastSeenInfo = getLastSeenInfo();

  if (loading) {
    return (
      <>
        <Header />
        <div className="container" style={{ paddingTop: '20px' }}>
          <div className="loading">Загрузка...</div>
        </div>
      </>
    );
  }

  if (error || !user) {
    return (
      <>
        <Header />
        <div className="container" style={{ paddingTop: '20px' }}>
          <div className="error">{error || 'Пользователь не найден'}</div>
        </div>
      </>
    );
  }

  const relationshipChoices = [
    ['single', 'Не женат / Не замужем'],
    ['in_relationship', 'В отношениях'],
    ['engaged', 'Помолвлен(а)'],
    ['married', 'Женат / Замужем'],
    ['complicated', 'Всё сложно'],
    ['open', 'В открытых отношениях'],
    ['widowed', 'Вдовец / Вдова'],
    ['separated', 'В разводе'],
  ];

  const politicalChoices = [
    ['very_conservative', 'Очень консервативные'],
    ['conservative', 'Консервативные'],
    ['moderate', 'Умеренные'],
    ['liberal', 'Либеральные'],
    ['very_liberal', 'Очень либеральные'],
    ['apolitical', 'Аполитичен'],
  ];

  const smokingChoices = [
    ['no', 'Не курю'],
    ['yes', 'Курю'],
    ['sometimes', 'Иногда'],
  ];

  const drinkingChoices = [
    ['no', 'Не пью'],
    ['yes', 'Пью'],
    ['sometimes', 'Иногда'],
    ['socially', 'В компании'],
  ];

  return (
    <>
      <Header />
      <div className="container" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card">
            <div className="card-body" style={{ padding: '25px' }}>
              <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                <Avatar user={user} size="xl" />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <h2 style={{ marginBottom: '8px', fontSize: '20px', fontWeight: 'bold' }}>
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : user.username
                        }
                      </h2>
                      <div style={{ fontSize: '13px', color: 'var(--fb-text-light)', marginBottom: '15px' }}>
                        @{user.username}
                        {lastSeenInfo && (
                          <span
                            style={{
                              marginLeft: '10px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: lastSeenInfo.online ? 'var(--fb-green)' : 'var(--fb-text-light)',
                              fontSize: '12px',
                            }}
                          >
                            {lastSeenInfo.online && (
                              <FaCircle size={6} style={{ color: 'var(--fb-green)' }} />
                            )}
                            {lastSeenInfo.text}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {isOwnProfile ? (
                        <Link to="/profile/edit" className="btn btn-secondary btn-sm">
                          <FaEdit /> Редактировать
                        </Link>
                      ) : (
                        <>
                          <Link
                            to={`/messages/new/${user.username}`}
                            className="btn btn-primary btn-sm"
                          >
                            <FaEnvelope /> Написать
                          </Link>
                          <FriendshipButton user={user} onStatusChange={loadProfile} />
                        </>
                      )}
                    </div>
                  </div>

                  {user.profile?.bio && (
                    <div style={{ 
                      padding: '15px', 
                      backgroundColor: 'var(--fb-hover)', 
                      borderRadius: '3px',
                      marginBottom: '20px',
                      fontSize: '13px',
                      lineHeight: '1.5'
                    }}>
                      {user.profile.bio}
                    </div>
                  )}

                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px',
                    fontSize: '13px', 
                    color: 'var(--fb-text)',
                    marginBottom: '15px'
                  }}>
                    {user.profile?.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaMapMarkerAlt style={{ color: 'var(--fb-text-light)', fontSize: '14px' }} /> 
                        <span>{user.profile.location}</span>
                      </div>
                    )}
                    
                    {user.profile?.website && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaLink style={{ color: 'var(--fb-text-light)', fontSize: '14px' }} /> 
                        <a href={user.profile.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--fb-blue)' }}>
                          {user.profile.website}
                        </a>
                      </div>
                    )}

                    {user.profile?.birth_date && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaBirthdayCake style={{ color: 'var(--fb-text-light)', fontSize: '14px' }} /> 
                        <span>
                          {new Date(user.profile.birth_date).toLocaleDateString('ru-RU', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    )}

                    <div style={{ 
                      marginTop: '5px', 
                      paddingTop: '15px',
                      borderTop: '1px solid var(--fb-border)',
                      color: 'var(--fb-text-light)', 
                      fontSize: '12px' 
                    }}>
                      На сайте с {new Date(user.created_at).toLocaleDateString('ru-RU', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>

                  {user.is_admin_user && (
                    <div style={{ 
                      marginTop: '15px',
                      padding: '8px 14px',
                      backgroundColor: 'var(--fb-blue)',
                      color: 'white',
                      borderRadius: '3px',
                      fontSize: '11px',
                      display: 'inline-block',
                      fontWeight: 'bold',
                      letterSpacing: '0.5px'
                    }}>
                      АДМИНИСТРАТОР
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Дополнительная информация */}
          {(user.profile?.relationship_status || 
            user.profile?.political_views || 
            user.profile?.religious_views ||
            user.profile?.interests ||
            user.profile?.favorite_music ||
            user.profile?.favorite_movies ||
            user.profile?.favorite_books ||
            user.profile?.smoking ||
            user.profile?.drinking ||
            user.profile?.life_position) && (
            <div className="card" style={{ marginTop: '20px' }}>
              <div className="card-header" style={{ padding: '15px 20px' }}>
                Дополнительная информация
              </div>
              <div className="card-body" style={{ padding: '20px 25px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {user.profile?.relationship_status && (
                    <div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: 'var(--fb-text-light)', 
                        marginBottom: '6px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        <FaHeart style={{ marginRight: '6px', fontSize: '12px' }} /> Семейное положение
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--fb-text)' }}>
                        {getChoiceDisplay(user.profile.relationship_status, relationshipChoices)}
                      </div>
                    </div>
                  )}

                  {user.profile?.political_views && (
                    <div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: 'var(--fb-text-light)', 
                        marginBottom: '6px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Политические взгляды
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--fb-text)' }}>
                        {getChoiceDisplay(user.profile.political_views, politicalChoices)}
                      </div>
                    </div>
                  )}

                  {user.profile?.religious_views && (
                    <div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: 'var(--fb-text-light)', 
                        marginBottom: '6px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Религиозные взгляды
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--fb-text)', lineHeight: '1.5' }}>
                        {user.profile.religious_views}
                      </div>
                    </div>
                  )}

                  {user.profile?.interests && (
                    <div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: 'var(--fb-text-light)', 
                        marginBottom: '6px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Интересы
                      </div>
                      <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap', color: 'var(--fb-text)', lineHeight: '1.6' }}>
                        {user.profile.interests}
                      </div>
                    </div>
                  )}

                  {user.profile?.favorite_music && (
                    <div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: 'var(--fb-text-light)', 
                        marginBottom: '6px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        <FaMusic style={{ marginRight: '6px', fontSize: '12px' }} /> Любимая музыка
                      </div>
                      <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap', color: 'var(--fb-text)', lineHeight: '1.6' }}>
                        {user.profile.favorite_music}
                      </div>
                    </div>
                  )}

                  {user.profile?.favorite_movies && (
                    <div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: 'var(--fb-text-light)', 
                        marginBottom: '6px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        <FaFilm style={{ marginRight: '6px', fontSize: '12px' }} /> Любимые фильмы
                      </div>
                      <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap', color: 'var(--fb-text)', lineHeight: '1.6' }}>
                        {user.profile.favorite_movies}
                      </div>
                    </div>
                  )}

                  {user.profile?.favorite_books && (
                    <div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: 'var(--fb-text-light)', 
                        marginBottom: '6px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        <FaBook style={{ marginRight: '6px', fontSize: '12px' }} /> Любимые книги
                      </div>
                      <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap', color: 'var(--fb-text)', lineHeight: '1.6' }}>
                        {user.profile.favorite_books}
                      </div>
                    </div>
                  )}

                  {(user.profile?.smoking || user.profile?.drinking) && (
                    <div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: 'var(--fb-text-light)', 
                        marginBottom: '6px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Вредные привычки
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--fb-text)', lineHeight: '1.5' }}>
                        {user.profile?.smoking && (
                          <div style={{ marginBottom: '4px' }}>Курение: {getChoiceDisplay(user.profile.smoking, smokingChoices)}</div>
                        )}
                        {user.profile?.drinking && (
                          <div>Алкоголь: {getChoiceDisplay(user.profile.drinking, drinkingChoices)}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {user.profile?.life_position && (
                    <div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: 'var(--fb-text-light)', 
                        marginBottom: '6px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Жизненная позиция
                      </div>
                      <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap', color: 'var(--fb-text)', lineHeight: '1.6' }}>
                        {user.profile.life_position}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Посты пользователя и лайкнутые посты */}
          <div className="card" style={{ marginTop: '20px' }}>
            <div className="card-header" style={{ padding: '15px 20px' }}>
              <div style={{ display: 'flex', gap: '20px', borderBottom: '2px solid var(--fb-border)' }}>
                <button
                  onClick={() => handleTabChange('posts')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '10px 0',
                    cursor: 'pointer',
                    borderBottom: activeTab === 'posts' ? '2px solid var(--fb-blue)' : '2px solid transparent',
                    color: activeTab === 'posts' ? 'var(--fb-blue)' : 'var(--fb-text-light)',
                    fontWeight: activeTab === 'posts' ? 'bold' : 'normal',
                    marginBottom: '-2px'
                  }}
                >
                  Посты ({userPosts.length})
                </button>
                <button
                  onClick={() => handleTabChange('liked')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '10px 0',
                    cursor: 'pointer',
                    borderBottom: activeTab === 'liked' ? '2px solid var(--fb-blue)' : '2px solid transparent',
                    color: activeTab === 'liked' ? 'var(--fb-blue)' : 'var(--fb-text-light)',
                    fontWeight: activeTab === 'liked' ? 'bold' : 'normal',
                    marginBottom: '-2px'
                  }}
                >
                  <FaThumbsUp style={{ marginRight: '5px' }} />
                  Лайкнутые ({likedPosts.length})
                </button>
              </div>
            </div>
            <div className="card-body" style={{ padding: '20px' }}>
              {loadingPosts ? (
                <div className="loading">Загрузка...</div>
              ) : activeTab === 'posts' ? (
                userPosts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {userPosts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--fb-text-light)' }}>
                    {isOwnProfile ? 'Вы еще не создали ни одного поста' : 'У этого пользователя пока нет постов'}
                  </div>
                )
              ) : (
                likedPosts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {likedPosts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--fb-text-light)' }}>
                    {isOwnProfile ? 'Вы еще не лайкнули ни одного поста' : 'Этот пользователь еще не лайкнул ни одного поста'}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;