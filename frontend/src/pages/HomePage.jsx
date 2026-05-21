import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const API_URL = 'https://diplom-esin.onrender.com/api';

function HomePage({ vkUser }) {
  const [activeLotteries, setActiveLotteries] = useState([]);
  const [finishedLotteries, setFinishedLotteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, finished: 0 });

  useEffect(() => {
    fetchLotteries();
  }, []);

  const fetchLotteries = async () => {
    try {
      const res = await fetch(`${API_URL}/lotteries`);
      const data = await res.json();
      
      const active = data.filter(l => l.status === 'active');
      const finished = data.filter(l => l.status === 'finished');
      
      setActiveLotteries(active);
      setFinishedLotteries(finished);
      setStats({
        total: data.length,
        active: active.length,
        finished: finished.length
      });
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Хиро-секция */}
      {!vkUser && (
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">🎁 Розыгрыши для подписчиков</h1>
            <p className="hero-subtitle">
              Участвуйте в розыгрышах призов от сообщества. Войдите через ВКонтакте, чтобы начать!
            </p>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-num">{stats.total}</span>
                <span className="hero-stat-label">Розыгрышей</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-num">{stats.active}</span>
                <span className="hero-stat-label">Активных</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-num">{stats.finished}</span>
                <span className="hero-stat-label">Завершённых</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Активные розыгрыши */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">🔥 Активные розыгрыши</h2>
          <span className="section-badge">{activeLotteries.length}</span>
        </div>
        
        {activeLotteries.length === 0 ? (
          <div className="empty-block">
            <span className="empty-icon">📭</span>
            <p className="empty-text">Сейчас нет активных розыгрышей</p>
            <p className="empty-subtext">Загляните позже или создайте новый в админке</p>
          </div>
        ) : (
          <div className="lottery-grid">
            {activeLotteries.map((lottery) => (
              <Link to={`/lottery/${lottery.id}`} key={lottery.id} className="lottery-card">
                <div className="card-badge" data-status="active">Активен</div>
                <h3 className="card-title">{lottery.title}</h3>
                <p className="card-prize">🏆 {lottery.prize}</p>
                {lottery.description && (
                  <p className="card-desc">{lottery.description}</p>
                )}
                <div className="card-footer">
                  <span className="card-date">⏰ До {formatDate(lottery.end_date)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Завершённые розыгрыши */}
      {finishedLotteries.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">✅ Завершённые</h2>
            <span className="section-badge finished">{finishedLotteries.length}</span>
          </div>
          <div className="lottery-grid finished-grid">
            {finishedLotteries.map((lottery) => (
              <Link to={`/lottery/${lottery.id}`} key={lottery.id} className="lottery-card finished-card">
                <div className="card-badge" data-status="finished">Завершён</div>
                <h3 className="card-title">{lottery.title}</h3>
                <p className="card-prize">🏆 {lottery.prize}</p>
                {lottery.winner_id && (
                  <p className="card-winner">🎉 Победитель определён</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Как участвовать */}
      <div className="section how-to">
        <h2 className="section-title">📋 Как участвовать?</h2>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <div className="step-content">
              <h4>Войдите через VK</h4>
              <p>Нажмите «Войти через VK» и введите ссылку на ваш профиль</p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <div className="step-content">
              <h4>Выберите розыгрыш</h4>
              <p>Откройте активный розыгрыш и нажмите «Участвовать»</p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <div className="step-content">
              <h4>Ждите результата</h4>
              <p>Победитель выбирается случайно. Всем удачи! 🍀</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;