import React, { useState, useEffect } from 'react';
import '../styles/LoadingModal.css';

const LoadingModal = ({ isVisible, message = 'Enregistrement en cours' }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal">
        <div className="loading-spinner"></div>
        <p className="loading-text">{message}</p>
        <p className="loading-time">Temps écoulé: {formatTime(elapsedSeconds)}</p>
      </div>
    </div>
  );
};

export default LoadingModal;
