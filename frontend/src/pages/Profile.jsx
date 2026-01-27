import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaCog } from 'react-icons/fa';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Avatar from '../components/Avatar';
import { FaMapMarkerAlt, FaLink, FaBirthdayCake } from 'react-icons/fa';


const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
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

                    {isOwnProfile && (
                      <Link to="/profile/edit" className="btn btn-secondary btn-sm">
                        <FaEdit /> Редактировать
                      </Link>
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
                        <FaLink style={{ marginRight: '5px' }} /> <a href={user.profile.website}>
                          {user.profile.website}
                        </a>
                      </div>
                    )}

                    {user.profile?.birth_date && (
                      <div style={{ marginBottom: '5px' }}>
                        <FaBirthdayCake style={{ marginRight: '5px' }} /> {new Date(user.profile.birth_date).toLocaleDateString('ru-RU', { 
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
        </div>
      </div>
    </>
  );
};

export default Profile;