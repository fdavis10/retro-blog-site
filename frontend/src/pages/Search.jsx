import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { blogService } from '../services/blogService';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import { FaSearch } from 'react-icons/fa';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    } else {
      setResults(null);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const performSearch = async (searchQuery) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const searchResults = await blogService.search(searchQuery);
        setResults(searchResults);
      } catch (err) {
        console.error('Search error:', err);
        setResults({ posts: [], categories: [], comments: [] });
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce 300ms
  };

  const handleSearchChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setSearchParams({ q: newQuery });
  };

  return (
    <>
      <Header />
      <div className="container" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card">
            <div className="card-header">
              <h2 style={{ margin: 0, fontSize: '20px' }}>Поиск</h2>
            </div>
            <div className="card-body" style={{ padding: '20px' }}>
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={query}
                      onChange={handleSearchChange}
                      placeholder="Введите запрос для поиска..."
                      style={{
                        padding: '12px 45px 12px 15px',
                        borderRadius: '0',
                        border: '1px solid var(--fb-border)',
                        fontSize: '16px',
                        width: '100%'
                      }}
                      autoFocus
                    />
                    <FaSearch
                      style={{
                        position: 'absolute',
                        right: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--fb-text-light)',
                        fontSize: '18px'
                      }}
                    />
                  </div>
                  <small style={{ fontSize: '12px', color: 'var(--fb-text-light)', marginTop: '5px', display: 'block' }}>
                    Поиск по постам, рубрикам и комментариям
                  </small>
                </div>
              </form>

              {loading && (
                <div className="loading" style={{ textAlign: 'center', padding: '20px' }}>
                  Поиск...
                </div>
              )}

              {!loading && query.trim() && results && (
                <div>
                  {/* Посты */}
                  {results.posts && results.posts.length > 0 && (
                    <div style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '16px', marginBottom: '15px', color: 'var(--fb-text-light)' }}>
                        Посты ({results.posts.length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {results.posts.map(post => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Рубрики */}
                  {results.categories && results.categories.length > 0 && (
                    <div style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '16px', marginBottom: '15px', color: 'var(--fb-text-light)' }}>
                        Рубрики ({results.categories.length})
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {results.categories.map(cat => (
                          <div
                            key={cat.id}
                            style={{
                              display: 'inline-block',
                              padding: '8px 16px',
                              borderRadius: '0',
                              fontSize: '14px',
                              fontWeight: '500',
                              backgroundColor: cat.color,
                              color: cat.color === '#F7B928' || cat.color === '#45BD62' ? '#000' : '#fff',
                              border: 'none'
                            }}
                          >
                            {cat.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Комментарии */}
                  {results.comments && results.comments.length > 0 && (
                    <div style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '16px', marginBottom: '15px', color: 'var(--fb-text-light)' }}>
                        Комментарии ({results.comments.length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {results.comments.map(comment => (
                          <div
                            key={comment.id}
                            style={{
                              padding: '15px',
                              border: '1px solid var(--fb-border)',
                              borderRadius: '4px',
                              backgroundColor: 'var(--fb-hover)'
                            }}
                          >
                            <div style={{ marginBottom: '8px', fontSize: '13px' }}>
                              <strong>{comment.author.username}</strong>
                              {' в посте '}
                              <a
                                href={`/post/${comment.post.id}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(`/post/${comment.post.id}`);
                                }}
                                style={{ color: 'var(--fb-blue)', textDecoration: 'none' }}
                              >
                                "{comment.post.title}"
                              </a>
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--fb-text)', lineHeight: '1.5' }}>
                              {comment.content}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--fb-text-light)', marginTop: '8px' }}>
                              {new Date(comment.created_at).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Нет результатов */}
                  {(!results.posts || results.posts.length === 0) &&
                   (!results.categories || results.categories.length === 0) &&
                   (!results.comments || results.comments.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--fb-text-light)' }}>
                      <p style={{ fontSize: '16px', marginBottom: '10px' }}>Ничего не найдено</p>
                      <p style={{ fontSize: '14px' }}>Попробуйте изменить запрос</p>
                    </div>
                  )}
                </div>
              )}

              {!loading && !query.trim() && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--fb-text-light)' }}>
                  <FaSearch style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.3 }} />
                  <p style={{ fontSize: '16px' }}>Введите запрос для поиска</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Search;
