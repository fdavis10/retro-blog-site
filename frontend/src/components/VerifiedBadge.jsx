import React from 'react';
import { FaCheck } from 'react-icons/fa';

const VerifiedBadge = ({ size = 'default', className = '' }) => {
  const sizes = {
    sm: 14,
    default: 16,
    lg: 18,
    xl: 20
  };
  
  const dimension = sizes[size] || sizes.default;
  const iconSize = Math.round(dimension * 0.6);
  
  return (
    <span
      className={`verified-badge ${className}`}
      title="Верифицированный пользователь. Этот аккаунт был подтвержден администратором."
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${dimension}px`,
        height: `${dimension}px`,
        borderRadius: '50%',
        backgroundColor: '#1877f2', // Facebook blue
        color: 'white',
        marginLeft: '4px',
        verticalAlign: 'middle',
        flexShrink: 0,
        cursor: 'help'
      }}
    >
      <FaCheck size={iconSize} />
    </span>
  );
};

export default VerifiedBadge;
