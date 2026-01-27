import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogService } from '../services/blogService';
import Header from '../components/Header';
import RichTextEditor from '../components/RichTextEditor';
import { FaImage, FaPaperclip } from 'react-icons/fa';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Введите заголовок поста');
      return;
    }

    if (!content.trim()) {
      setError('Напишите содержание поста');
      return;
    }

    setLoading(true);

    try {
      await blogService.createPost({
        title,
        content,
        images,
        attachments,
        is_published: isPublished,
      });

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка создания поста');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="card">
            <div className="card-header">
              Создать новый пост
            </div>
            
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="error" style={{ marginBottom: '15px' }}>
                    {error}
                  </div>
                )}

                {/* Заголовок */}
                <div className="form-group">
                  <label className="form-label">Заголовок</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Введите заголовок поста"
                    required
                  />
                </div>

                {/* Содержание */}
                <div className="form-group">
                  <label className="form-label">Содержание</label>
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Напишите ваш пост здесь..."
                  />
                </div>

                {/* Изображения */}
                <div className="form-group">
                  <label className="form-label">Изображения</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                  {images.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      {images.map((image, index) => (
                        <div 
                          key={index}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            marginBottom: '5px',
                            fontSize: '12px'
                          }}
                        >
                          <span><FaImage style={{ marginRight: '5px' }} /> {image.name}</span>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="btn btn-sm btn-danger"
                            style={{ marginLeft: '10px' }}
                          >
                            Удалить
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Вложения */}
                <div className="form-group">
                  <label className="form-label">Вложения (аудио, документы)</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".pdf,.doc,.docx,.mp3,.wav,.ogg"
                    multiple
                    onChange={handleAttachmentChange}
                  />
                  {attachments.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      {attachments.map((file, index) => (
                        <div 
                          key={index}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            marginBottom: '5px',
                            fontSize: '12px'
                          }}
                        >
                          <span><FaPaperclip style={{ marginRight: '5px' }} /> {file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="btn btn-sm btn-danger"
                            style={{ marginLeft: '10px' }}
                          >
                            Удалить
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Опубликовать */}
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    <span className="form-label" style={{ marginBottom: 0 }}>
                      Опубликовать сразу
                    </span>
                  </label>
                </div>

                {/* Кнопки */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Создание...' : 'Создать пост'}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => navigate('/')}
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

export default CreatePost;