import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Avatar from '../components/Avatar';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    birth_date: '',
    email_notifications: true,
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        bio: user.profile?.bio || '',
        location: user.profile?.location || '',
        website: user.profile?.website || '',
        birth_date: user.profile?.birth_date || '',
        email_notifications: user.profile?.email_notifications ?? true,
      });
      setAvatarPreview(user.profile?.avatar);
    }
  }, [user]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setLoading(true);

  try {
    const updateData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      profile: {
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        birth_date: formData.birth_date || null,
        email_notifications: formData.email_notifications,
      },
    };

    if (avatar) {
      updateData.profile.avatar = avatar;
    }

    // ОТЛАДКА: Выводим данные перед отправкой
    console.log('📤 Sending update data:', {
      first_name: updateData.first_name,
      last_name: updateData.last_name,
      email: updateData.email,
      profile: {
        bio: updateData.profile.bio,
        location: updateData.profile.location,
        website: updateData.profile.website,
        birth_date: updateData.profile.birth_date,
        email_notifications: updateData.profile.email_notifications,
        has_avatar: !!updateData.profile.avatar
      }
    });

    const updatedUser = await authService.updateProfile(updateData);
    
    console.log('✅ Updated user data:', updatedUser);
    
    if (!updatedUser.username) {
      console.error('Missing username in response:', updatedUser);
      throw new Error('Получены неполные данные пользователя (отсутствует username)');
    }
    
    if (updatedUser.is_admin_user === undefined || updatedUser.is_staff === undefined) {
      console.error('Missing admin flags in response:', updatedUser);
      throw new Error('Получены неполные данные пользователя (отсутствуют права)');
    }
    
    updateUser(updatedUser);
    setSuccess('Профиль успешно обновлен!');
    
    setTimeout(() => {
      navigate(`/profile/${updatedUser.username}`);
    }, 1500);
  } catch (err) {
    setError(err.response?.data?.error || err.message || 'Ошибка обновления профиля');
    console.error('Update profile error:', err);
    // ДОПОЛНИТЕЛЬНАЯ ОТЛАДКА
    if (err.response) {
      console.error('Response data:', err.response.data);
      console.error('Response status:', err.response.status);
    }
  } finally {
    setLoading(false);
  }
};

  // ИСПРАВЛЕНИЕ: Защита от отсутствия user
  if (!user) {
    return (
      <>
        <Header />
        <div className="container" style={{ paddingTop: '20px' }}>
          <div className="loading">Загрузка...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card">
            <div className="card-header">
              Редактировать профиль
            </div>
            
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}

                <div className="form-group">
                  <label className="form-label">Аватар</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview}
                        alt="Avatar preview"
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          borderRadius: '3px',
                          border: '1px solid var(--fb-border)',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <Avatar 
                        user={user} 
                        size="lg"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="form-control"
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Имя</label>
                  <input
                    type="text"
                    name="first_name"
                    className="form-control"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Фамилия</label>
                  <input
                    type="text"
                    name="last_name"
                    className="form-control"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">О себе</label>
                  <textarea
                    name="bio"
                    className="form-control"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Расскажите немного о себе..."
                    maxLength="500"
                  />
                  <div style={{ fontSize: '11px', color: 'var(--fb-text-light)', marginTop: '5px' }}>
                    {formData.bio.length}/500 символов
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Местоположение</label>
                  <input
                    type="text"
                    name="location"
                    className="form-control"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Город, страна"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Веб-сайт</label>
                  <input
                    type="url"
                    name="website"
                    className="form-control"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Дата рождения</label>
                  <input
                    type="date"
                    name="birth_date"
                    className="form-control"
                    value={formData.birth_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <div style={{ 
                    padding: '15px', 
                    backgroundColor: 'var(--fb-hover)', 
                    borderRadius: '3px',
                    border: '1px solid var(--fb-border)'
                  }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      cursor: 'pointer',
                      margin: 0
                    }}>
                      <input
                        type="checkbox"
                        name="email_notifications"
                        checked={formData.email_notifications}
                        onChange={handleChange}
                        style={{ 
                          marginRight: '10px',
                          marginTop: '2px',
                          cursor: 'pointer'
                        }}
                      />
                      <div>
                        <div className="form-label" style={{ marginBottom: '5px' }}>
                          📧 Email-уведомления о новых постах
                        </div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: 'var(--fb-text-light)',
                          lineHeight: '1.4'
                        }}>
                          Получать уведомления на email при публикации новых постов в блоге
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Сохранение...' : 'Сохранить'}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => navigate(`/profile/${user.username}`)}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;