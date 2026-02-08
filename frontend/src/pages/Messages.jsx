import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messagesService } from '../services/messagesService';
import { parseSmilies } from '../utils/smilies';
import Header from '../components/Header';
import Avatar from '../components/Avatar';
import SmileyPicker from '../components/SmileyPicker';
import { FaArrowLeft } from 'react-icons/fa';

const POLL_INTERVAL = 3000;
const MOBILE_BREAKPOINT = 768;

const Messages = () => {
  const { user: currentUser } = useAuth();
  const { conversationId, username } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const data = await messagesService.getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Ошибка загрузки диалогов');
      console.error(err);
    }
  };

  const loadMessages = async (convId) => {
    if (!convId) return;
    try {
      const data = await messagesService.getMessages(convId);
      setMessages(Array.isArray(data) ? data : []);
      await messagesService.markAsRead(convId);
      scrollToBottom();
    } catch (err) {
      setError('Ошибка загрузки сообщений');
      console.error(err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (username) {
      messagesService.getConversationWithUser(username)
        .then((conv) => {
          setSelectedConversation(conv);
          setConversations((prev) => {
            const found = prev.find((c) => c.id === conv.id);
            return found ? prev : [conv, ...prev];
          });
          navigate(`/messages/${conv.id}`, { replace: true });
        })
        .catch(() => setError('Не удалось начать диалог'))
        .finally(() => setLoading(false));
      return;
    }
    if (conversationId) {
      const conv = conversations.find((c) => c.id === parseInt(conversationId));
      if (conv) {
        setSelectedConversation(conv);
        loadMessages(conv.id);
      } else if (conversations.length > 0) {
        navigate(`/messages/${conversations[0].id}`, { replace: true });
      }
    } else if (conversations.length > 0 && !isMobile) {
      navigate(`/messages/${conversations[0].id}`, { replace: true });
    }
    setLoading(false);
  }, [conversationId, username, conversations, isMobile]);

  useEffect(() => {
    if (!selectedConversation?.id) return;
    loadMessages(selectedConversation.id);

    pollRef.current = setInterval(() => {
      loadMessages(selectedConversation.id);
      loadConversations();
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedConversation?.id]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !selectedConversation || sending) return;

    setSending(true);
    setError('');
    try {
      const msg = await messagesService.sendMessage(selectedConversation.id, text);
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
      loadConversations();
      scrollToBottom();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка отправки');
    } finally {
      setSending(false);
    }
  };

  const handleSmileyInsert = (code) => {
    setNewMessage((prev) => prev + code);
  };

  const otherUser = selectedConversation?.other_user;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setMobileShowChat(!!selectedConversation);
  }, [selectedConversation]);

  const handleBackToList = () => {
    setMobileShowChat(false);
    setSelectedConversation(null);
    navigate('/messages');
  };

  return (
    <>
      <Header />
      <div className="messages-page">
        <div className={`messages-layout ${isMobile ? 'messages-layout-mobile' : ''}`}>
          <div className={`messages-sidebar ${isMobile && mobileShowChat ? 'messages-sidebar-hidden' : ''}`}>
            <div className="messages-sidebar-header">
              <h2>Сообщения</h2>
            </div>
            <div className="messages-conversations-list">
              {loading ? (
                <div className="loading">Загрузка...</div>
              ) : conversations.length === 0 ? (
                <div className="messages-empty">Нет диалогов</div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`messages-conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                    onClick={() => navigate(`/messages/${conv.id}`)}
                  >
                    <Avatar
                      user={{
                        ...conv.other_user,
                        profile: conv.other_user.profile,
                      }}
                      size="lg"
                    />
                    <div className="messages-conv-info">
                      <div className="messages-conv-name">
                        {conv.other_user.first_name && conv.other_user.last_name
                          ? `${conv.other_user.first_name} ${conv.other_user.last_name}`
                          : conv.other_user.username}
                      </div>
                      {conv.last_message && (
                        <div className="messages-conv-preview">
                          {conv.last_message.sender_username === currentUser?.username ? 'Вы: ' : ''}
                          {conv.last_message.content}
                        </div>
                      )}
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="messages-unread-badge">{conv.unread_count}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={`messages-chat ${isMobile && !mobileShowChat ? 'messages-chat-hidden' : ''}`}>
            {selectedConversation ? (
              <>
                <div className="messages-chat-header">
                  {isMobile && (
                    <button
                      type="button"
                      className="messages-back-btn"
                      onClick={handleBackToList}
                      aria-label="Назад к списку"
                    >
                      <FaArrowLeft size={20} />
                    </button>
                  )}
                  <Avatar
                    user={{
                      ...otherUser,
                      profile: otherUser?.profile,
                    }}
                    size="default"
                  />
                  <div className="messages-chat-header-info">
                    <span className="messages-chat-name">
                      {otherUser?.first_name && otherUser?.last_name
                        ? `${otherUser.first_name} ${otherUser.last_name}`
                        : otherUser?.username}
                    </span>
                    <span className="messages-chat-username">@{otherUser?.username}</span>
                  </div>
                </div>

                <div className="messages-list">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message-bubble ${msg.sender === currentUser?.id ? 'own' : ''}`}
                    >
                      <div className="message-text">{parseSmilies(msg.content)}</div>
                      <div className="message-meta">
                        {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form className="messages-input-form" onSubmit={handleSend}>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <div className="messages-input-row">
                    <SmileyPicker onInsert={handleSmileyInsert} visible={true} />
                    <textarea
                      className="messages-input"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Написать сообщение..."
                      rows={1}
                      maxLength={2000}
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={sending || !newMessage.trim()}
                    >
                      {sending ? '...' : 'Отправить'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="messages-select-hint">
                {isMobile ? (
                  <>Нажмите на диалог сверху или <a href="/friends" onClick={(e) => { e.preventDefault(); navigate('/friends'); }}>найдите друга</a></>
                ) : (
                  <>Выберите диалог или <a href="/friends" onClick={(e) => { e.preventDefault(); navigate('/friends'); }}>найдите друга</a>, чтобы начать общение</>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Messages;
