import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header({ vkUser, onLogin, onLogout }) {
  const [showLogin, setShowLogin] = useState(false);
  const [profile, setProfile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();

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

  const isAdmin = vkUser && ['232665125', '344405498'].includes(String(vkUser.id));
  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <span className="logo-icon">🎁</span>
          <span className="logo-text">Розыгрыши</span>
        </Link>

        <nav className="header-nav desktop-nav">
          <Link to="/" className={isActive('/')}>🏠 Главная</Link>
          <Link to="/winners" className={isActive('/winners')}>🏆 Победители</Link>
          <Link to="/rules" className={isActive('/rules')}>📋 Правила</Link>
          {isAdmin && (
            <Link to="/admin" className={isActive('/admin')}>⚙️ Админка</Link>
          )}
        </nav>

        <div className="header-actions">
          {vkUser ? (
  <div className="user-logged-in">
    <Link to="/profile" className="user-info-link">
      <img src={vkUser.photo || 'https://vk.com/images/camera_100.png'} alt="" className="user-avatar" />
      <span className="user-name">{vkUser.first_name}</span>
    </Link>
    <button className="btn-logout-desktop" onClick={onLogout} title="Выйти">
      🚪
    </button>
  </div>
) : (
            <button className="btn-login" onClick={() => setShowLogin(true)}>
              🔑 Войти через VK
            </button>
          )}
          <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {mobileMenu && (
        <div className="mobile-nav">
          <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenu(false)}>🏠 Главная</Link>
          <Link to="/winners" className="mobile-nav-link" onClick={() => setMobileMenu(false)}>🏆 Победители</Link>
          <Link to="/rules" className="mobile-nav-link" onClick={() => setMobileMenu(false)}>📋 Правила</Link>
          {vkUser && (
            <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileMenu(false)}>👤 Профиль</Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="mobile-nav-link" onClick={() => setMobileMenu(false)}>⚙️ Админка</Link>
          )}
          {vkUser && (
            <button className="mobile-nav-link logout-btn" onClick={() => { onLogout(); setMobileMenu(false); }}>
              🚪 Выйти
            </button>
          )}
          {!vkUser && (
            <button className="mobile-nav-link login-btn" onClick={() => { setShowLogin(true); setMobileMenu(false); }}>
              🔑 Войти через VK
            </button>
          )}
        </div>
      )}

      {showLogin && (
        <div className="modal-overlay" onClick={() => { setShowLogin(false); setError(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setShowLogin(false); setError(''); }}>✕</button>
            <h3 className="modal-title">Вход через ВКонтакте</h3>
            <p className="modal-subtitle">Введите ссылку на ваш профиль, короткое имя или ID:</p>
            <input type="text" placeholder="vk.com/volgr или 232665125" value={profile} onChange={(e) => setProfile(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} className="modal-input" autoFocus />
            {error && <p className="modal-error">{error}</p>}
            <div className="modal-buttons">
              <button onClick={handleLogin} disabled={loading} className="modal-btn-submit">{loading ? 'Вход...' : 'Войти'}</button>
              <button onClick={() => { setShowLogin(false); setError(''); }} className="modal-btn-cancel">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;