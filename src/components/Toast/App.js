import React, { useEffect, useState } from 'react';
import '../../styles/App.css';

const Toast = ({ message, type, onClose, duration = 3000 }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!message) return null;

  return (
    <div className={`toast toast-${type} ${isClosing ? 'toast-closing' : ''}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
        </span>
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={handleClose}>×</button>
    </div>
  );
};

export default Toast;
