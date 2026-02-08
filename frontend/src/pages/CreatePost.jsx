import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogService } from '../services/blogService';
import Header from '../components/Header';
import RichTextEditor from '../components/RichTextEditor';
import { FaImage, FaPaperclip } from 'react-icons/fa';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryName, setCategoryName] = useState('');
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
        category_name: categoryName,
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
          <div className="card" style={{ borderRadius: '0', border: '1px solid var(--fb-border)' }}>
            <div className="card-header" style={{ 
              borderRadius: '0', 
              borderBottom: '1px solid var(--fb-border)',
              background: 'linear-gradient(#f6f7f8, #e9ebee)',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              Создать новый пост
            </div>
            
            <div className="card-body" style={{ padding: '20px' }}>
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="error" style={{ 
                    marginBottom: '15px',
                    borderRadius: '0',
                    border: '1px solid #dd3c10'
                  }}>
                    {error}
                  </div>
                )}

                {/* Заголовок */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ 
                    fontSize: '13px', 
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: 'var(--fb-text)'
                  }}>
                    Заголовок
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Введите заголовок поста"
                    required
                    style={{
                      borderRadius: '0',
                      border: '1px solid var(--fb-border)',
                      padding: '10px 12px',
                      fontSize: '13px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Содержание */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ 
                    fontSize: '13px', 
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: 'var(--fb-text)'
                  }}>
                    Содержание
                  </label>
                  <div style={{
                    border: '1px solid var(--fb-border)',
                    borderRadius: '0'
                  }}>
                    <RichTextEditor
                      value={content}
                      onChange={setContent}
                      placeholder="Напишите ваш пост здесь..."
                    />
                  </div>
                </div>

                {/* Рубрики */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ 
                    fontSize: '13px', 
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: 'var(--fb-text)'
                  }}>
                    Рубрики (необязательно)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Например: Программирование, Кодинг"
                    style={{
                      borderRadius: '0',
                      border: '1px solid var(--fb-border)',
                      padding: '10px 12px',
                      fontSize: '13px',
                      fontFamily: 'inherit'
                    }}
                  />
                  <small style={{ 
                    fontSize: '11px', 
                    color: 'var(--fb-text-light)', 
                    marginTop: '6px', 
                    display: 'block',
                    lineHeight: '1.4'
                  }}>
                    Укажите несколько рубрик через запятую. Если рубрика новая, ей будет автоматически присвоен цвет.
                  </small>
                </div>

                {/* Изображения */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ 
                    fontSize: '13px', 
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: 'var(--fb-text)'
                  }}>
                    Изображения
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{
                      borderRadius: '0',
                      border: '1px solid var(--fb-border)',
                      padding: '8px 10px',
                      fontSize: '13px',
                      fontFamily: 'inherit'
                    }}
                  />
                  {images.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      {images.map((image, index) => (
                        <div 
                          key={index}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                            padding: '8px 10px',
                            background: 'var(--fb-hover)',
                            border: '1px solid var(--fb-border)',
                            borderRadius: '0',
                            fontSize: '12px'
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            <FaImage style={{ marginRight: '8px', color: 'var(--fb-text-light)' }} /> 
                            {image.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="btn btn-sm btn-danger"
                            style={{ 
                              marginLeft: '10px',
                              borderRadius: '0',
                              padding: '4px 10px',
                              fontSize: '11px'
                            }}
                          >
                            Удалить
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Вложения */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ 
                    fontSize: '13px', 
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: 'var(--fb-text)'
                  }}>
                    Вложения (аудио, документы)
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".pdf,.doc,.docx,.mp3,.wav,.ogg"
                    multiple
                    onChange={handleAttachmentChange}
                    style={{
                      borderRadius: '0',
                      border: '1px solid var(--fb-border)',
                      padding: '8px 10px',
                      fontSize: '13px',
                      fontFamily: 'inherit'
                    }}
                  />
                  {attachments.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      {attachments.map((file, index) => (
                        <div 
                          key={index}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                            padding: '8px 10px',
                            background: 'var(--fb-hover)',
                            border: '1px solid var(--fb-border)',
                            borderRadius: '0',
                            fontSize: '12px'
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            <FaPaperclip style={{ marginRight: '8px', color: 'var(--fb-text-light)' }} /> 
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="btn btn-sm btn-danger"
                            style={{ 
                              marginLeft: '10px',
                              borderRadius: '0',
                              padding: '4px 10px',
                              fontSize: '11px'
                            }}
                          >
                            Удалить
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Опубликовать */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 'bold'
                  }}>
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      style={{ 
                        marginRight: '8px',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ marginBottom: 0, color: 'var(--fb-text)' }}>
                      Опубликовать сразу
                    </span>
                  </label>
                </div>

                {/* Кнопки */}
                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  marginTop: '25px',
                  paddingTop: '20px',
                  borderTop: '1px solid var(--fb-border)'
                }}>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                    style={{
                      borderRadius: '0',
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}
                  >
                    {loading ? 'Создание...' : 'Создать пост'}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => navigate('/')}
                    style={{
                      borderRadius: '0',
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}
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