import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserFriends, FaUserPlus, FaUserMinus, FaBan, FaCheck, FaTimes } from 'react-icons/fa';
import Header from '../components/Header';
import Avatar from '../components/Avatar';
import friendsService from '../services/friendsService';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('friends'); // friends, subscribers, subscriptions, requests, blocked
  const [friends, setFriends] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'friends') {
        const data = await friendsService.getMyFriends();
        setFriends(Array.isArray(data) ? data : (data.results || []));
      } else if (activeTab === 'subscribers') {
        const data = await friendsService.getMySubscribers();
        setSubscribers(Array.isArray(data) ? data : (data.results || []));
      } else if (activeTab === 'subscriptions') {
        const data = await friendsService.getMySubscriptions();
        setSubscriptions(Array.isArray(data) ? data : (data.results || []));
      } else if (activeTab === 'requests') {
        const incoming = await friendsService.getIncomingRequests();
        const outgoing = await friendsService.getOutgoingRequests();
        setIncomingRequests(Array.isArray(incoming) ? incoming : (incoming.results || []));
        setOutgoingRequests(Array.isArray(outgoing) ? outgoing : (outgoing.results || []));
      } else if (activeTab === 'blocked') {
        const data = await friendsService.getBlockedUsers();
        setBlockedUsers(Array.isArray(data) ? data : (data.results || []));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (userId) => {
    if (!window.confirm('Удалить из друзей?')) return;
    
    try {
      await friendsService.removeFriend(userId);
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await friendsService.acceptFriendRequest(requestId);
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await friendsService.rejectFriendRequest(requestId);
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка');
    }
  };

  const handleCancelRequest = async (userId) => {
    try {
      await friendsService.cancelFriendRequest(userId);
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка');
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await friendsService.unblockUser(userId);
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка');
    }
  };

  return (
    <>
      <Header />
      <div className="container" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '20px' }}>
            <FaUserFriends /> Друзья
          </h1>

          {/* Табы */}
          <div style={{ 
            display: 'flex', 
            gap: '5px', 
            marginBottom: '15px',
            flexWrap: 'wrap'
          }}>
            <button
              className={`btn btn-sm ${activeTab === 'friends' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('friends')}
            >
              Мои друзья ({friends.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('requests')}
            >
              Заявки ({incomingRequests.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'subscriptions' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('subscriptions')}
            >
              Подписки ({subscriptions.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'subscribers' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('subscribers')}
            >
              Подписчики ({subscribers.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'blocked' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('blocked')}
            >
              Черный список ({blockedUsers.length})
            </button>
          </div>

          {/* Контент */}
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="loading">Загрузка...</div>
              ) : (
                <>
                  {/* Друзья */}
                  {activeTab === 'friends' && (
                    <>
                      {friends.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--fb-text-light)' }}>
                          У вас пока нет друзей
                        </div>
                      ) : (
                        friends.map((friendship) => (
                          <div
                            key={friendship.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '10px',
                              borderBottom: '1px solid var(--fb-border)',
                            }}
                          >
                            <Avatar user={friendship.friend} size="default" />
                            <div style={{ flex: 1, marginLeft: '10px' }}>
                              <Link
                                to={`/profile/${friendship.friend.username}`}
                                style={{ fontWeight: 'bold', fontSize: '13px' }}
                              >
                                {friendship.friend.first_name && friendship.friend.last_name
                                  ? `${friendship.friend.first_name} ${friendship.friend.last_name}`
                                  : friendship.friend.username}
                              </Link>
                              <div style={{ fontSize: '11px', color: 'var(--fb-text-light)' }}>
                                @{friendship.friend.username}
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveFriend(friendship.friend.id)}
                              className="btn btn-secondary btn-sm"
                            >
                              <FaUserMinus /> Удалить
                            </button>
                          </div>
                        ))
                      )}
                    </>
                  )}

                  {/* Заявки */}
                  {activeTab === 'requests' && (
                    <>
                      <h3 style={{ fontSize: '14px', marginBottom: '10px', fontWeight: 'bold' }}>
                        Входящие заявки ({incomingRequests.length})
                      </h3>
                      {incomingRequests.length === 0 ? (
                        <div style={{ padding: '10px', color: 'var(--fb-text-light)', fontSize: '13px' }}>
                          Нет входящих заявок
                        </div>
                      ) : (
                        incomingRequests.map((request) => (
                          <div
                            key={request.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '10px',
                              borderBottom: '1px solid var(--fb-border)',
                            }}
                          >
                            <Avatar user={request.from_user} size="default" />
                            <div style={{ flex: 1, marginLeft: '10px' }}>
                              <Link
                                to={`/profile/${request.from_user.username}`}
                                style={{ fontWeight: 'bold', fontSize: '13px' }}
                              >
                                {request.from_user.first_name && request.from_user.last_name
                                  ? `${request.from_user.first_name} ${request.from_user.last_name}`
                                  : request.from_user.username}
                              </Link>
                              <div style={{ fontSize: '11px', color: 'var(--fb-text-light)' }}>
                                {new Date(request.created_at).toLocaleString('ru-RU')}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <button
                                onClick={() => handleAcceptRequest(request.id)}
                                className="btn btn-success btn-sm"
                              >
                                <FaCheck /> Принять
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                className="btn btn-secondary btn-sm"
                              >
                                <FaTimes /> Отклонить
                              </button>
                            </div>
                          </div>
                        ))
                      )}

                      <h3 style={{ fontSize: '14px', margin: '20px 0 10px', fontWeight: 'bold' }}>
                        Исходящие заявки ({outgoingRequests.length})
                      </h3>
                      {outgoingRequests.length === 0 ? (
                        <div style={{ padding: '10px', color: 'var(--fb-text-light)', fontSize: '13px' }}>
                          Нет исходящих заявок
                        </div>
                      ) : (
                        outgoingRequests.map((request) => (
                          <div
                            key={request.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '10px',
                              borderBottom: '1px solid var(--fb-border)',
                            }}
                          >
                            <Avatar user={request.to_user} size="default" />
                            <div style={{ flex: 1, marginLeft: '10px' }}>
                              <Link
                                to={`/profile/${request.to_user.username}`}
                                style={{ fontWeight: 'bold', fontSize: '13px' }}
                              >
                                {request.to_user.first_name && request.to_user.last_name
                                  ? `${request.to_user.first_name} ${request.to_user.last_name}`
                                  : request.to_user.username}
                              </Link>
                              <div style={{ fontSize: '11px', color: 'var(--fb-text-light)' }}>
                                {new Date(request.created_at).toLocaleString('ru-RU')}
                              </div>
                            </div>
                            <button
                              onClick={() => handleCancelRequest(request.to_user.id)}
                              className="btn btn-secondary btn-sm"
                            >
                              Отменить
                            </button>
                          </div>
                        ))
                      )}
                    </>
                  )}

                  {/* Подписки */}
                  {activeTab === 'subscriptions' && (
                    <>
                      {subscriptions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--fb-text-light)' }}>
                          Нет подписок
                        </div>
                      ) : (
                        subscriptions.map((subscription) => (
                          <div
                            key={subscription.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '10px',
                              borderBottom: '1px solid var(--fb-border)',
                            }}
                          >
                            <Avatar user={subscription.subscribed_to} size="default" />
                            <div style={{ flex: 1, marginLeft: '10px' }}>
                              <Link
                                to={`/profile/${subscription.subscribed_to.username}`}
                                style={{ fontWeight: 'bold', fontSize: '13px' }}
                              >
                                {subscription.subscribed_to.first_name && subscription.subscribed_to.last_name
                                  ? `${subscription.subscribed_to.first_name} ${subscription.subscribed_to.last_name}`
                                  : subscription.subscribed_to.username}
                              </Link>
                              <div style={{ fontSize: '11px', color: 'var(--fb-text-light)' }}>
                                @{subscription.subscribed_to.username}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </>
                  )}

                  {/* Подписчики */}
                  {activeTab === 'subscribers' && (
                    <>
                      {subscribers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--fb-text-light)' }}>
                          Нет подписчиков
                        </div>
                      ) : (
                        subscribers.map((subscription) => (
                          <div
                            key={subscription.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '10px',
                              borderBottom: '1px solid var(--fb-border)',
                            }}
                          >
                            <Avatar user={subscription.subscriber} size="default" />
                            <div style={{ flex: 1, marginLeft: '10px' }}>
                              <Link
                                to={`/profile/${subscription.subscriber.username}`}
                                style={{ fontWeight: 'bold', fontSize: '13px' }}
                              >
                                {subscription.subscriber.first_name && subscription.subscriber.last_name
                                  ? `${subscription.subscriber.first_name} ${subscription.subscriber.last_name}`
                                  : subscription.subscriber.username}
                              </Link>
                              <div style={{ fontSize: '11px', color: 'var(--fb-text-light)' }}>
                                @{subscription.subscriber.username}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </>
                  )}

                  {/* Черный список */}
                  {activeTab === 'blocked' && (
                    <>
                      {blockedUsers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--fb-text-light)' }}>
                          Черный список пуст
                        </div>
                      ) : (
                        blockedUsers.map((blocked) => (
                          <div
                            key={blocked.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '10px',
                              borderBottom: '1px solid var(--fb-border)',
                            }}
                          >
                            <Avatar user={blocked.blocked} size="default" />
                            <div style={{ flex: 1, marginLeft: '10px' }}>
                              <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                                {blocked.blocked.first_name && blocked.blocked.last_name
                                  ? `${blocked.blocked.first_name} ${blocked.blocked.last_name}`
                                  : blocked.blocked.username}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--fb-text-light)' }}>
                                @{blocked.blocked.username}
                              </div>
                            </div>
                            <button
                              onClick={() => handleUnblock(blocked.blocked.id)}
                              className="btn btn-secondary btn-sm"
                            >
                              <FaBan /> Разблокировать
                            </button>
                          </div>
                        ))
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Friends;