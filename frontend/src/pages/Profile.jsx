import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaEdit, FaMapMarkerAlt, FaLink, FaBirthdayCake, FaHeart, FaMusic, FaFilm, FaBook } from 'react-icons/fa';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Avatar from '../components/Avatar';
import FriendshipButton from '../components/FriendshipButton';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
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

  const isOwnProfile = currentUser?.username === username;

  // Функция для отображения выбора из списка
  const getChoiceDisplay = (value, choices) => {
    if (!value) return null;
    const choice = choices.find(c => c[0] === value);
    return choice ? choice[1] : value;
  };

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
      <div className="container" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <Avatar user={user} size="xl" />

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div>
                      <h2 style={{ marginBottom: '5px' }}>
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : user.username
                        }
                      </h2>
                      <div style={{ fontSize: '13px', color: 'var(--fb-text-light)' }}>
                        @{user.username}
                      </div>
                    </div>

                    {isOwnProfile ? (
                      <Link to="/profile/edit" className="btn btn-secondary btn-sm">
                        <FaEdit /> Редактировать
                      </Link>
                    ) : (
                      <FriendshipButton user={user} onStatusChange={loadProfile} />
                    )}
                  </div>

                  {user.profile?.bio && (
                    <div style={{ 
                      padding: '10px', 
                      backgroundColor: 'var(--fb-hover)', 
                      borderRadius: '3px',
                      marginBottom: '15px',
                      fontSize: '13px'
                    }}>
                      {user.profile.bio}
                    </div>
                  )}

                  <div style={{ fontSize: '13px', color: 'var(--fb-text)' }}>
                    {user.profile?.location && (
                      <div style={{ marginBottom: '5px' }}>
                        <FaMapMarkerAlt style={{ marginRight: '5px' }} /> {user.profile.location}
                      </div>
                    )}
                    
                    {user.profile?.website && (
                      <div style={{ marginBottom: '5px' }}>
                        <FaLink style={{ marginRight: '5px' }} /> 
                        <a href={user.profile.website} target="_blank" rel="noopener noreferrer">
                          {user.profile.website}
                        </a>
                      </div>
                    )}

                    {user.profile?.birth_date && (
                      <div style={{ marginBottom: '5px' }}>
                        <FaBirthdayCake style={{ marginRight: '5px' }} /> 
                        {new Date(user.profile.birth_date).toLocaleDateString('ru-RU', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </div>
                    )}

                    <div style={{ marginTop: '10px', color: 'var(--fb-text-light)', fontSize: '12px' }}>
                      На сайте с {new Date(user.created_at).toLocaleDateString('ru-RU', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>

                  {user.is_admin_user && (
                    <div style={{ 
                      marginTop: '10px',
                      padding: '5px 10px',
                      backgroundColor: 'var(--fb-blue)',
                      color: 'white',
                      borderRadius: '3px',
                      fontSize: '11px',
                      display: 'inline-block',
                      fontWeight: 'bold'
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
            <div className="card" style={{ marginTop: '10px' }}>
              <div className="card-header">
                Дополнительная информация
              </div>
              <div className="card-body">
                {user.profile?.relationship_status && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--fb-text-light)', marginBottom: '3px' }}>
                      <FaHeart style={{ marginRight: '5px' }} /> Семейное положение
                    </div>
                    <div style={{ fontSize: '13px' }}>
                      {getChoiceDisplay(user.profile.relationship_status, relationshipChoices)}
                    </div>
                  </div>
                )}

                {user.profile?.political_views && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--fb-text-light)', marginBottom: '3px' }}>
                      Политические взгляды
                    </div>
                    <div style={{ fontSize: '13px' }}>
                      {getChoiceDisplay(user.profile.political_views, politicalChoices)}
                    </div>
                  </div>
                )}

                {user.profile?.religious_views && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--fb-text-light)', marginBottom: '3px' }}>
                      Религиозные взгляды
                    </div>
                    <div style={{ fontSize: '13px' }}>
                      {user.profile.religious_views}
                    </div>
                  </div>
                )}

                {user.profile?.interests && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--fb-text-light)', marginBottom: '3px' }}>
                      Интересы
                    </div>
                    <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                      {user.profile.interests}
                    </div>
                  </div>
                )}

                {user.profile?.favorite_music && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--fb-text-light)', marginBottom: '3px' }}>
                      <FaMusic style={{ marginRight: '5px' }} /> Любимая музыка
                    </div>
                    <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                      {user.profile.favorite_music}
                    </div>
                  </div>
                )}

                {user.profile?.favorite_movies && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--fb-text-light)', marginBottom: '3px' }}>
                      <FaFilm style={{ marginRight: '5px' }} /> Любимые фильмы
                    </div>
                    <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                      {user.profile.favorite_movies}
                    </div>
                  </div>
                )}

                {user.profile?.favorite_books && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--fb-text-light)', marginBottom: '3px' }}>
                      <FaBook style={{ marginRight: '5px' }} /> Любимые книги
                    </div>
                    <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                      {user.profile.favorite_books}
                    </div>
                  </div>
                )}

                {(user.profile?.smoking || user.profile?.drinking) && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--fb-text-light)', marginBottom: '3px' }}>
                      Вредные привычки
                    </div>
                    <div style={{ fontSize: '13px' }}>
                      {user.profile?.smoking && (
                        <div>Курение: {getChoiceDisplay(user.profile.smoking, smokingChoices)}</div>
                      )}
                      {user.profile?.drinking && (
                        <div>Алкоголь: {getChoiceDisplay(user.profile.drinking, drinkingChoices)}</div>
                      )}
                    </div>
                  </div>
                )}

                {user.profile?.life_position && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--fb-text-light)', marginBottom: '3px' }}>
                      Жизненная позиция
                    </div>
                    <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                      {user.profile.life_position}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;