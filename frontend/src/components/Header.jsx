import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header({ vkUser, onLogin, onLogout }) {
  const [showLogin, setShowLogin] = useState(false);
  const [profile, setProfile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        {/* Десктопная навигация */}
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
            <div className="user-menu" ref={menuRef}>
              <button className="user-trigger" onClick={() => setMenuOpen(!menuOpen)}>
                <img src={vkUser.photo || 'https://vk.com/images/camera_100.png'} alt="" className="user-avatar" />
                <span className="user-name">{vkUser.first_name}</span>
                <span className={`menu-arrow ${menuOpen ? 'open' : ''}`}>▾</span>
              </button>
              
              {menuOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <img src={vkUser.photo || 'https://vk.com/images/camera_100.png'} alt="" className="dropdown-avatar" />
                    <div>
                      <div className="dropdown-name">{vkUser.first_name} {vkUser.last_name}</div>
                      <div className="dropdown-id">ID: {vkUser.id}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/" className="dropdown-item">🏠 Главная</Link>
                  <Link to="/winners" className="dropdown-item">🏆 Победители</Link>
                  <Link to="/rules" className="dropdown-item">📋 Правила</Link>
                  {isAdmin && (
                    <Link to="/admin" className="dropdown-item">⚙️ Админка</Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout" onClick={() => { onLogout(); setMenuOpen(false); }}>
                    🚪 Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn-login" onClick={() => setShowLogin(true)}>
              🔑 Войти через VK
            </button>
          )}
        </div>

        {/* Мобильное меню */}
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Мобильная навигация */}
      {menuOpen && !vkUser && (
        <div className="mobile-nav">
          <Link to="/" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>🏠 Главная</Link>
          <Link to="/winners" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>🏆 Победители</Link>
          <Link to="/rules" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>📋 Правила</Link>
        </div>
      )}

      {/* Модальное окно входа */}
      {showLogin && (
        <div className="modal-overlay" onClick={() => { setShowLogin(false); setError(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setShowLogin(false); setError(''); }}>✕</button>
            <h3 className="modal-title">Вход через ВКонтакте</h3>
            <p className="modal-subtitle">Введите ссылку на ваш профиль, короткое имя или ID:</p>
            <input
              type="text"
              placeholder="Например: vk.com/volgr или 232665125"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
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