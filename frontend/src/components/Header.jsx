import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ vkUser, onLogin, onLogout }) {
  const [showLogin, setShowLogin] = useState(false);
  const [profile, setProfile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!profile.trim()) {
      setError('Введите ссылку на профиль');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('https://diplom-esin.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(data);
        setShowLogin(false);
        setProfile('');
        setError('');
      } else {
        setError(data.error || 'Ошибка входа');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
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
            <button className="btn-login" onClick={() => setShowLogin(true)}>
              Войти через VK
            </button>
          )}
        </div>
      </div>

      {/* Модальное окно */}
      {showLogin && (
        <div className="modal-overlay" onClick={() => { setShowLogin(false); setError(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Вход через ВКонтакте</h3>
            <p className="modal-subtitle">Введите ссылку на ваш профиль, короткое имя или ID:</p>
            <input
              type="text"
              placeholder="Например: vk.com/volgr или 232665125"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              onKeyDown={handleKeyDown}
              className="modal-input"
              autoFocus
            />
            {error && <p className="modal-error">{error}</p>}
            <div className="modal-buttons">
              <button onClick={handleLogin} disabled={loading} className="modal-btn-submit">
                {loading ? 'Вход...' : 'Войти'}
              </button>
              <button onClick={() => { setShowLogin(false); setError(''); }} className="modal-btn-cancel">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;