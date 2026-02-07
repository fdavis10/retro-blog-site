import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Avatar from '../components/Avatar';

const ProfileEdit = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    location: '',
    website: '',
    birth_date: '',
    relationship_status: '',
    political_views: '',
    religious_views: '',
    interests: '',
    favorite_music: '',
    favorite_movies: '',
    favorite_books: '',
    smoking: '',
    drinking: '',
    life_position: '',
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
        bio: user.profile?.bio || '',
        location: user.profile?.location || '',
        website: user.profile?.website || '',
        birth_date: user.profile?.birth_date || '',
        relationship_status: user.profile?.relationship_status || '',
        political_views: user.profile?.political_views || '',
        religious_views: user.profile?.religious_views || '',
        interests: user.profile?.interests || '',
        favorite_music: user.profile?.favorite_music || '',
        favorite_movies: user.profile?.favorite_movies || '',
        favorite_books: user.profile?.favorite_books || '',
        smoking: user.profile?.smoking || '',
        drinking: user.profile?.drinking || '',
        life_position: user.profile?.life_position || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        profile: {
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          birth_date: formData.birth_date,
          relationship_status: formData.relationship_status,
          political_views: formData.political_views,
          religious_views: formData.religious_views,
          interests: formData.interests,
          favorite_music: formData.favorite_music,
          favorite_movies: formData.favorite_movies,
          favorite_books: formData.favorite_books,
          smoking: formData.smoking,
          drinking: formData.drinking,
          life_position: formData.life_position
        }
      };

      if (avatar) {
        updateData.avatar = avatar;
      }

      const updatedUser = await authService.updateProfile(updateData);
      updateUser(updatedUser);
      setSuccess('Профиль успешно обновлен!');
      
      setTimeout(() => {
        navigate(`/profile/${user.username}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка обновления профиля');
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
              Редактирование профиля
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Аватар */}
                <div className="form-group" style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <Avatar 
                    user={user} 
                    size="xl" 
                    src={avatarPreview}
                  />
                  <div style={{ marginTop: '10px' }}>
                    <label 
                      htmlFor="avatar-upload" 
                      className="btn btn-secondary btn-sm"
                      style={{ cursor: 'pointer' }}
                    >
                      Изменить фото
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                {/* Основная информация */}
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
                  Основная информация
                </h3>

                <div className="form-group">
                  <label>Имя</label>
                  <input
                    type="text"
                    name="first_name"
                    className="form-control"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Фамилия</label>
                  <input
                    type="text"
                    name="last_name"
                    className="form-control"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>О себе</label>
                  <textarea
                    name="bio"
                    className="form-control"
                    rows="3"
                    value={formData.bio}
                    onChange={handleChange}
                    maxLength={500}
                  />
                  <small style={{ fontSize: '11px', color: 'var(--fb-text-light)' }}>
                    {formData.bio.length}/500
                  </small>
                </div>

                <div className="form-group">
                  <label>Местоположение</label>
                  <input
                    type="text"
                    name="location"
                    className="form-control"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Веб-сайт</label>
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
                  <label>Дата рождения</label>
                  <input
                    type="date"
                    name="birth_date"
                    className="form-control"
                    value={formData.birth_date}
                    onChange={handleChange}
                  />
                </div>

                {/* Дополнительная информация */}
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '20px', marginBottom: '10px' }}>
                  Дополнительная информация
                </h3>

                <div className="form-group">
                  <label>Семейное положение</label>
                  <select
                    name="relationship_status"
                    className="form-control"
                    value={formData.relationship_status}
                    onChange={handleChange}
                  >
                    <option value="">Не указано</option>
                    <option value="single">Не женат / Не замужем</option>
                    <option value="in_relationship">В отношениях</option>
                    <option value="engaged">Помолвлен(а)</option>
                    <option value="married">Женат / Замужем</option>
                    <option value="complicated">Всё сложно</option>
                    <option value="open">В открытых отношениях</option>
                    <option value="widowed">Вдовец / Вдова</option>
                    <option value="separated">В разводе</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Политические взгляды</label>
                  <select
                    name="political_views"
                    className="form-control"
                    value={formData.political_views}
                    onChange={handleChange}
                  >
                    <option value="">Не указано</option>
                    <option value="very_conservative">Очень консервативные</option>
                    <option value="conservative">Консервативные</option>
                    <option value="moderate">Умеренные</option>
                    <option value="liberal">Либеральные</option>
                    <option value="very_liberal">Очень либеральные</option>
                    <option value="apolitical">Аполитичен</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Религиозные взгляды</label>
                  <input
                    type="text"
                    name="religious_views"
                    className="form-control"
                    value={formData.religious_views}
                    onChange={handleChange}
                    placeholder="Например: Христианство, Ислам, Атеизм..."
                  />
                </div>

                <div className="form-group">
                  <label>Интересы</label>
                  <textarea
                    name="interests"
                    className="form-control"
                    rows="3"
                    value={formData.interests}
                    onChange={handleChange}
                    placeholder="Расскажите о своих интересах и увлечениях..."
                  />
                </div>

                <div className="form-group">
                  <label>Любимая музыка</label>
                  <textarea
                    name="favorite_music"
                    className="form-control"
                    rows="2"
                    value={formData.favorite_music}
                    onChange={handleChange}
                    placeholder="Исполнители, группы, жанры..."
                  />
                </div>

                <div className="form-group">
                  <label>Любимые фильмы</label>
                  <textarea
                    name="favorite_movies"
                    className="form-control"
                    rows="2"
                    value={formData.favorite_movies}
                    onChange={handleChange}
                    placeholder="Названия фильмов, режиссеры, жанры..."
                  />
                </div>

                <div className="form-group">
                  <label>Любимые книги</label>
                  <textarea
                    name="favorite_books"
                    className="form-control"
                    rows="2"
                    value={formData.favorite_books}
                    onChange={handleChange}
                    placeholder="Авторы, названия книг, жанры..."
                  />
                </div>

                <div className="form-group">
                  <label>Курение</label>
                  <select
                    name="smoking"
                    className="form-control"
                    value={formData.smoking}
                    onChange={handleChange}
                  >
                    <option value="">Не указано</option>
                    <option value="no">Не курю</option>
                    <option value="yes">Курю</option>
                    <option value="sometimes">Иногда</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Алкоголь</label>
                  <select
                    name="drinking"
                    className="form-control"
                    value={formData.drinking}
                    onChange={handleChange}
                  >
                    <option value="">Не указано</option>
                    <option value="no">Не пью</option>
                    <option value="yes">Пью</option>
                    <option value="sometimes">Иногда</option>
                    <option value="socially">В компании</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Жизненная позиция</label>
                  <textarea
                    name="life_position"
                    className="form-control"
                    rows="3"
                    value={formData.life_position}
                    onChange={handleChange}
                    placeholder="Ваши взгляды на жизнь, принципы, мировоззрение..."
                  />
                </div>

                {error && (
                  <div className="alert alert-danger" style={{ marginTop: '15px' }}>
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success" style={{ marginTop: '15px' }}>
                    {success}
                  </div>
                )}

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
                    disabled={loading}
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

export default ProfileEdit;