import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaThumbsUp, FaComment, FaEdit, FaTrash } from 'react-icons/fa';
import { blogService } from '../services/blogService';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Avatar from '../components/Avatar';
import NotificationBanner from '../components/NotificationBanner';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FaPaperclip } from 'react-icons/fa';

const PostDetail = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [id]);

  const loadPost = async () => {
    try {
      const data = await blogService.getPost(id);
      setPost(data);
    } catch (err) {
      setError('Ошибка загрузки поста');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await blogService.getComments(id);
      setComments(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      console.error(err);
      setComments([]);
    }
  };

  const handleLike = async () => {
    try {
      const response = await blogService.toggleLike(post.id);
      setPost(prev => ({
        ...prev,
        is_liked: response.is_liked,
        likes_count: response.likes_count
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      await blogService.addComment(id, newComment);
      setNewComment('');
      loadComments();
    } catch (err) {
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Удалить комментарий?')) return;

    try {
      await blogService.deleteComment(commentId);
      loadComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот пост?')) return;

    try {
      await blogService.deletePost(post.id);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: ru 
      });
    } catch {
      return dateString;
    }
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

  if (error || !post) {
    return (
      <>
        <Header />
        <div className="container" style={{ paddingTop: '20px' }}>
          <div className="error">{error || 'Пост не найден'}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <NotificationBanner />
          <div style={{ marginBottom: '15px' }}>
            <Link to="/" className="btn btn-secondary btn-sm">
              ← Назад к ленте
            </Link>
          </div>

          <div className="card post">
            <div className="post-header">
              <Avatar user={post.author} size="default" />
              <div className="post-author-info">
                <Link to={`/profile/${post.author.username}`} className="post-author-name">
                  {post.author.first_name && post.author.last_name 
                    ? `${post.author.first_name} ${post.author.last_name}`
                    : post.author.username
                  }
                </Link>
                <div className="post-date">{formatDate(post.created_at)}</div>
              </div>

              {post.author.id === user.id && (
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '5px' }}>
                  <Link 
                    to={`/post/${post.id}/edit`}
                    className="btn btn-sm btn-secondary"
                  >
                    <FaEdit /> Редактировать
                  </Link>
                  <button
                    onClick={handleDeletePost}
                    className="btn btn-sm btn-danger"
                  >
                    <FaTrash /> Удалить
                  </button>
                </div>
              )}
            </div>

            <div className="post-content">
              {post.category && (
                <div style={{ marginBottom: '15px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '500',
                      backgroundColor: post.category.color,
                      color: post.category.color === '#F7B928' || post.category.color === '#45BD62' ? '#000' : '#fff',
                    }}
                  >
                    {post.category.name}
                  </span>
                </div>
              )}
              <h2 style={{ marginBottom: '15px' }}>{post.title}</h2>
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            {post.images && post.images.length > 0 && (
              <div>
                {post.images.map((image) => (
                  <img 
                    key={image.id}
                    src={image.image} 
                    alt={image.caption || 'Post image'}
                    className="post-image"
                  />
                ))}
              </div>
            )}

            {post.attachments && post.attachments.length > 0 && (
              <div style={{ padding: '15px', borderTop: '1px solid var(--fb-border)' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--fb-text-light)' }}>
                  Вложения:
                </div>
                {post.attachments.map((attachment) => (
                  <div key={attachment.id} style={{ marginBottom: '5px' }}>
                    <a 
                      href={attachment.file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontSize: '12px' }}
                    >
                      <FaPaperclip style={{ marginRight: '5px' }} /> {attachment.file_name} ({(attachment.file_size / 1024).toFixed(1)} KB)
                    </a>
                  </div>
                ))}
              </div>
            )}

            <div className="post-actions">
              <button 
                className={`post-action ${post.is_liked ? 'active' : ''}`}
                onClick={handleLike}
              >
                <FaThumbsUp />
                <span>Нравится {post.likes_count > 0 && `(${post.likes_count})`}</span>
              </button>

              <div className="post-action">
                <FaComment />
                <span>Комментарии ({comments.length})</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '10px' }}>
            <div className="card-header">
              Комментарии ({comments.length})
            </div>
            
            <div className="card-body">
              <form onSubmit={handleAddComment} style={{ marginBottom: '20px' }}>
                <div className="form-group">
                  <textarea
                    className="form-control"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Написать комментарий..."
                    rows="3"
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm"
                  disabled={commentLoading || !newComment.trim()}
                >
                  {commentLoading ? 'Отправка...' : 'Отправить'}
                </button>
              </form>

              {comments.length === 0 ? (
                <p style={{ color: 'var(--fb-text-light)', fontSize: '13px', textAlign: 'center' }}>
                  Пока нет комментариев. Будьте первым!
                </p>
              ) : (
                <div>
                  {comments.map((comment) => (
                    <div key={comment.id} className="comment">
                      <Avatar user={comment.author} size="sm" />
                      <div className="comment-bubble">
                        <div className="comment-author">
                          <Link to={`/profile/${comment.author.username}`}>
                            {comment.author.first_name && comment.author.last_name 
                              ? `${comment.author.first_name} ${comment.author.last_name}`
                              : comment.author.username
                            }
                          </Link>
                        </div>
                        <div className="comment-text">{comment.content}</div>
                        <div className="comment-date">
                          {formatDate(comment.created_at)}
                          {comment.author.id === user.id && (
                            <>
                              {' · '}
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                style={{ 
                                  background: 'none', 
                                  border: 'none', 
                                  color: 'var(--fb-blue)', 
                                  cursor: 'pointer',
                                  fontSize: '10px'
                                }}
                              >
                                Удалить
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostDetail;