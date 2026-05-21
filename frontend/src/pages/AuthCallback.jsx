import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthCallback({ onLogin }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.id) {
        onLogin(event.data);
        navigate('/');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLogin, navigate]);

  return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <h2>Завершение авторизации...</h2>
      <p>Не закрывайте страницу</p>
    </div>
  );
}

export default AuthCallback;