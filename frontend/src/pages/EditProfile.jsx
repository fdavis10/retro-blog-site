import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

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
      });
      setAvatarPreview(user.profile?.avatar);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
        },
      };

      if (avatar) {
        updateData.profile.avatar = avatar;
      }

      const updatedUser = await authService.updateProfile(updateData);
      updateUser(updatedUser);
      setSuccess('Профиль успешно обновлен!');
      
      setTimeout(() => {
        navigate(`/profile/${user.username}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка обновления профиля');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

                {/* Аватар */}
                <div className="form-group">
                  <label className="form-label">Аватар</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img 
                      src={avatarPreview || '/default-avatar.png'} 
                      alt="Avatar preview"
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '3px',
                        border: '1px solid var(--fb-border)',
                        objectFit: 'cover'
                      }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="form-control"
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                {/* Имя */}
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

                {/* Фамилия */}
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

                {/* Email */}
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

                {/* О себе */}
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

                {/* Местоположение */}
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

                {/* Веб-сайт */}
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

                {/* Дата рождения */}
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

                {/* Кнопки */}
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