import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaThumbsUp, FaComment } from 'react-icons/fa';
import { blogService } from '../services/blogService';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import Avatar from './Avatar';

const PostCard = ({ post, onLikeToggle }) => {
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  const handleLike = async () => {
    try {
      const response = await blogService.toggleLike(post.id);
      setIsLiked(response.is_liked);
      setLikesCount(response.likes_count);
      if (onLikeToggle) onLikeToggle();
    } catch (error) {
      console.error('Error toggling like:', error);
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

  return (
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
      </div>

      <div className="post-content">
        <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 style={{ marginBottom: '10px' }}>{post.title}</h3>
        </Link>
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
                📎 {attachment.file_name} ({(attachment.file_size / 1024).toFixed(1)} KB)
              </a>
            </div>
          ))}
        </div>
      )}

      <div className="post-actions">
        <button 
          className={`post-action ${isLiked ? 'active' : ''}`}
          onClick={handleLike}
        >
          <FaThumbsUp />
          <span>Нравится {likesCount > 0 && `(${likesCount})`}</span>
        </button>

        <Link 
          to={`/post/${post.id}`}
          className="post-action"
          style={{ textDecoration: 'none' }}
        >
          <FaComment />
          <span>Комментировать {post.comments_count > 0 && `(${post.comments_count})`}</span>
        </Link>
      </div>
    </div>
  );
};

export default PostCard;