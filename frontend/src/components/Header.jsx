import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ vkUser, onLogout }) {
  const handleVKLogin = () => {
    const API_URL = process.env.REACT_APP_API_URL || 'https://diplom-esin.onrender.com/api';
    const authUrl = API_URL.replace('/api', '/api/auth/vk');
    window.open(authUrl, 'vk_auth', 'width=600,height=500');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">🎁 Розыгрыши</Link>
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
            <button className="btn-login" onClick={handleVKLogin}>Войти через VK</button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;