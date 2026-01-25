import React, { useState, useEffect } from 'react';
import { blogService } from '../services/blogService';
import PostCard from '../components/PostCard';
import Header from '../components/Header';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [page]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await blogService.getPosts(page);
      
      if (page === 1) {
        setPosts(data.results || data);
      } else {
        setPosts(prev => [...prev, ...(data.results || data)]);
      }
      
      setHasMore(!!data.next);
      setError('');
    } catch (err) {
      setError('Ошибка загрузки постов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <>
      <Header />
      <div className="container" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {error && <div className="error">{error}</div>}

          {loading && page === 1 ? (
            <div className="loading">Загрузка постов...</div>
          ) : posts.length === 0 ? (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '30px' }}>
                <p style={{ fontSize: '14px', color: 'var(--fb-text-light)' }}>
                  Пока нет постов. Посты может создавать только администратор.
                </p>
              </div>
            </div>
          ) : (
            <>
              {posts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post}
                  onLikeToggle={loadPosts}
                />
              ))}

              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button 
                    onClick={handleLoadMore}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    {loading ? 'Загрузка...' : 'Загрузить ещё'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;