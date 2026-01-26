import React from 'react';

const Avatar = ({ user, size = 'default', className = '' }) => {
  const sizes = {
    sm: 30,
    default: 40,
    lg: 50,
    xl: 120
  };
  
  const dimension = sizes[size] || sizes.default;
  
  // Если есть аватар - показываем его
  if (user.profile?.avatar) {
    return (
      <img 
        src={user.profile.avatar}
        alt={user.username}
        className={`avatar ${className}`}
        style={{ 
          width: `${dimension}px`, 
          height: `${dimension}px`,
          objectFit: 'cover',
          borderRadius: '2px',
          border: '1px solid var(--fb-border)'
        }}
      />
    );
  }
  
  // Генерируем инициалы
  const getInitials = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };
  
  // Генерируем цвет на основе username (чтобы у каждого был свой цвет)
  const getColor = () => {
    const colors = [
      '#3b5998', // Facebook blue
      '#42b72a', // Green
      '#f02849', // Red
      '#8b9dc3', // Light blue
      '#ff6f61', // Coral
      '#6b5b95', // Purple
      '#88b04b', // Olive
      '#f7cac9', // Rose
      '#92a8d1', // Serenity
      '#955251', // Marsala
    ];
    
    // Простой хеш из username для выбора цвета
    let hash = 0;
    for (let i = 0; i < user.username.length; i++) {
      hash = user.username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  return (
    <div 
      className={`avatar ${className}`}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        borderRadius: '2px',
        border: '1px solid var(--fb-border)',
        backgroundColor: getColor(),
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${dimension / 2.5}px`,
        fontWeight: 'bold',
        flexShrink: 0
      }}
    >
      {getInitials()}
    </div>
  );
};

export default Avatar;