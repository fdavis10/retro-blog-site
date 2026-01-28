import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaUserCheck, FaClock, FaUserTimes, FaBan } from 'react-icons/fa';
import friendsService from '../services/friendsService';

const FriendshipButton = ({ user, onStatusChange }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, [user.id]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const data = await friendsService.getFriendshipStatus(user.id);
      setStatus(data);
    } catch (error) {
      console.error('Error loading friendship status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    try {
      await friendsService.sendFriendRequest(user.id);
      await loadStatus();
      if (onStatusChange) onStatusChange();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка отправки заявки');
    }
  };

  const handleCancelRequest = async () => {
    try {
      await friendsService.cancelFriendRequest(user.id);
      await loadStatus();
      if (onStatusChange) onStatusChange();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка отмены заявки');
    }
  };

  const handleRemoveFriend = async () => {
    if (!window.confirm('Удалить из друзей?')) return;
    
    try {
      await friendsService.removeFriend(user.id);
      await loadStatus();
      if (onStatusChange) onStatusChange();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка удаления из друзей');
    }
  };

  const handleBlock = async () => {
    if (!window.confirm('Заблокировать пользователя?')) return;
    
    try {
      await friendsService.blockUser(user.id);
      await loadStatus();
      if (onStatusChange) onStatusChange();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка блокировки');
    }
  };

  const handleUnblock = async () => {
    try {
      await friendsService.unblockUser(user.id);
      await loadStatus();
      if (onStatusChange) onStatusChange();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка разблокировки');
    }
  };

  if (loading) {
    return <div style={{ fontSize: '12px', color: 'var(--fb-text-light)' }}>Загрузка...</div>;
  }

  if (!status) return null;

  // Если заблокирован
  if (status.is_blocked) {
    return (
      <button onClick={handleUnblock} className="btn btn-secondary btn-sm">
        <FaBan /> Разблокировать
      </button>
    );
  }

  // Если заблокировали нас
  if (status.blocked_by) {
    return (
      <div style={{ fontSize: '12px', color: 'var(--fb-text-light)' }}>
        Пользователь недоступен
      </div>
    );
  }

  // Если друзья
  if (status.is_friend) {
    return (
      <div style={{ display: 'flex', gap: '5px' }}>
        <button className="btn btn-success btn-sm" disabled>
          <FaUserCheck /> Друзья
        </button>
        <button onClick={handleRemoveFriend} className="btn btn-secondary btn-sm">
          Удалить из друзей
        </button>
        <button onClick={handleBlock} className="btn btn-danger btn-sm">
          <FaBan />
        </button>
      </div>
    );
  }

  // Если входящая заявка (показываем в другом месте, тут не нужно)
  if (status.received_request) {
    return (
      <div style={{ fontSize: '12px', color: 'var(--fb-blue)' }}>
        <FaClock /> Ожидает вашего ответа
      </div>
    );
  }

  // Если исходящая заявка
  if (status.sent_request) {
    return (
      <div style={{ display: 'flex', gap: '5px' }}>
        <button className="btn btn-secondary btn-sm" disabled>
          <FaClock /> Заявка отправлена
        </button>
        <button onClick={handleCancelRequest} className="btn btn-secondary btn-sm">
          Отменить
        </button>
        <button onClick={handleBlock} className="btn btn-danger btn-sm">
          <FaBan />
        </button>
      </div>
    );
  }

  // Если нет отношений - показываем кнопку добавления
  return (
    <div style={{ display: 'flex', gap: '5px' }}>
      <button onClick={handleSendRequest} className="btn btn-primary btn-sm">
        <FaUserPlus /> Добавить в друзья
      </button>
      <button onClick={handleBlock} className="btn btn-danger btn-sm">
        <FaBan />
      </button>
    </div>
  );
};

export default FriendshipButton;