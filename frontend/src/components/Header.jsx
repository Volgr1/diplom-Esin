import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Header({ vkUser, onLogout }) {
  const handleVKLogin = () => {
    const authUrl = `${API_URL.replace('/api', '')}/api/auth/vk`;
    const width = 600;
    const height = 500;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      authUrl,
      'vk_auth',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          🎁 Розыгрыши
        </Link>
        <nav className="header-nav">
          <Link to="/" className="nav-link">Главная</Link>
          <Link to="/admin" className="nav-link">Админка</Link>
        </nav>
        <div className="header-user">
          {vkUser ? (
            <div className="user-info">
              <img src={vkUser.photo} alt="" className="user-avatar" />
              <span className="user-name">{vkUser.first_name}</span>
              <button className="btn-logout" onClick={onLogout}>Выйти</button>
            </div>
          ) : (
            <button className="btn-login" onClick={handleVKLogin}>
              Войти через VK
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;