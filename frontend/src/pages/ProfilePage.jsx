import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ProfilePage.css';

const API_URL = 'https://diplom-esin.onrender.com/api';

function ProfilePage({ vkUser, onLogout }) {
  const [stats, setStats] = useState({ wins: 0, participations: 0, winRate: 0 });
  const [wonLotteries, setWonLotteries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vkUser) {
      fetchStats();
    }
  }, [vkUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/participants/stats/${vkUser.id}`);
      const data = await res.json();
      setStats({
        wins: data.wins || 0,
        participations: data.participations || 0,
        winRate: data.participations > 0 ? Math.round((data.wins / data.participations) * 100) : 0
      });
      setWonLotteries(data.wonLotteries || []);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!vkUser) {
    return (
      <div className="profile-page">
        <div className="empty-block">
          <span className="empty-icon">🔒</span>
          <p className="empty-text">Войдите, чтобы увидеть профиль</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Шапка профиля */}
      <div className="profile-header">
        <img src={vkUser.photo || 'https://vk.com/images/camera_100.png'} alt="" className="profile-avatar" />
        <div className="profile-info">
          <h1 className="profile-name">{vkUser.first_name} {vkUser.last_name}</h1>
          <p className="profile-id">ID: {vkUser.id}</p>
        </div>
      </div>

      {/* Статистика */}
            <div style={{ textAlign: 'right', marginBottom: '16px' }}>
        <button 
          onClick={onLogout}
          style={{
            background: '#FFEBEE',
            color: '#E53935',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🚪 Выйти из профиля
        </button>
      </div>
      <div className="profile-stats">
        <div className="stat-card">
          <span className="stat-icon">🎯</span>
          <span className="stat-num">{stats.participations}</span>
          <span className="stat-label">Участий</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🏆</span>
          <span className="stat-num">{stats.wins}</span>
          <span className="stat-label">Побед</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <span className="stat-num">{stats.winRate}%</span>
          <span className="stat-label">Процент побед</span>
        </div>
      </div>

      {/* Выигранные розыгрыши */}
      <div className="profile-section">
        <h2 className="section-title">🏆 Выигранные розыгрыши</h2>
        {wonLotteries.length === 0 ? (
          <p className="empty-text">Пока нет побед</p>
        ) : (
          <div className="won-list">
            {wonLotteries.map(l => (
              <Link to={`/lottery/${l.id}`} key={l.id} className="won-card">
                <h3>{l.title}</h3>
                <p>Приз: {l.prize}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;