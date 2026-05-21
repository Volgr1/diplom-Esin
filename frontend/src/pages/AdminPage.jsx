import React, { useState, useEffect } from 'react';
import './AdminPage.css';

const API_URL = 'https://diplom-esin.onrender.com/api';
const ADMIN_IDS = ['232665125', '344405498'];

function AdminPage({ vkUser }) {
  const [lotteries, setLotteries] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prize, setPrize] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [showWheel, setShowWheel] = useState(false);
  const [winnerData, setWinnerData] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [wheelParticipants, setWheelParticipants] = useState([]);

  useEffect(() => {
    fetchLotteries();
  }, []);

  const isAdmin = vkUser && ADMIN_IDS.includes(String(vkUser.id));

  const fetchLotteries = async () => {
    try {
      const res = await fetch(`${API_URL}/lotteries`);
      const data = await res.json();
      setLotteries(data);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/lotteries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, prize, end_date: endDate })
      });

      if (res.ok) {
        setMessage('✅ Розыгрыш создан!');
        setTitle('');
        setDescription('');
        setPrize('');
        setEndDate('');
        fetchLotteries();
      } else {
        const data = await res.json();
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Ошибка соединения');
    }
  };

  const handleSelectWinner = async (lotteryId) => {
    try {
      const res = await fetch(`${API_URL}/participants/lottery/${lotteryId}`);
      const data = await res.json();

      if (data.length === 0) {
        setMessage('❌ Нет участников для выбора победителя');
        return;
      }

      setWheelParticipants(data);
      setShowWheel(true);
      setSpinning(true);

      setTimeout(async () => {
        const winnerRes = await fetch(`${API_URL}/lotteries/${lotteryId}/select-winner`, {
          method: 'POST'
        });
        const winnerData = await winnerRes.json();

        if (winnerRes.ok) {
          setWinnerData(winnerData.winner);
          setSpinning(false);
          fetchLotteries();
        } else {
          setMessage(`❌ ${winnerData.error}`);
          setShowWheel(false);
          setSpinning(false);
        }
      }, 3000);
    } catch (error) {
      setMessage('❌ Ошибка соединения');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <h1 className="admin-title">Доступ запрещён</h1>
        <p>Только администраторы могут просматривать эту страницу.</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1 className="admin-title">Админ-панель</h1>

      <div className="admin-card">
        <h2 className="card-title">Создать новый розыгрыш</h2>
        <form onSubmit={handleCreate} className="admin-form">
          <input
            type="text"
            placeholder="Название розыгрыша"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="admin-input"
          />
          <input
            type="text"
            placeholder="Описание (необязательно)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="admin-input"
          />
          <input
            type="text"
            placeholder="Приз"
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
            required
            className="admin-input"
          />
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="admin-input"
          />
          <button type="submit" className="btn-create">Создать розыгрыш</button>
        </form>
      </div>

      {message && <p className="admin-message">{message}</p>}

      <div className="admin-card">
        <h2 className="card-title">Управление розыгрышами</h2>
        {lotteries.length === 0 ? (
          <p className="empty-text">Розыгрышей пока нет</p>
        ) : (
          <div className="admin-list">
            {lotteries.map((lottery) => (
              <div key={lottery.id} className="admin-item">
                <div className="admin-item-info">
                  <span className="admin-item-title">{lottery.title}</span>
                  <span className="admin-item-prize">{lottery.prize}</span>
                  <span className="admin-item-date">до {formatDate(lottery.end_date)}</span>
                  <span className={`admin-item-status status-${lottery.status}`}>
                    {lottery.status === 'active' ? 'Активен' : 'Завершён'}
                  </span>
                  {lottery.winner_id && (
                    <span className="admin-item-winner">Победитель: {lottery.winner_id}</span>
                  )}
                </div>
                {lottery.status === 'active' && (
                  <button
                    className="btn-winner"
                    onClick={() => handleSelectWinner(lottery.id)}
                  >
                    Выбрать победителя
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Колесо фортуны */}
      {showWheel && (
        <div className="wheel-overlay">
          <div className="wheel-container">
            <h2>Выбираем победителя...</h2>
            <div className="wheel">
              <div className={`wheel-spinner ${spinning ? 'spinning' : ''}`}>
                <div className="wheel-pointer"></div>
                {wheelParticipants.map((p, i) => (
                  <div
                    key={p.id}
                    className="wheel-segment"
                    style={{
                      transform: `rotate(${(360 / wheelParticipants.length) * i}deg)`,
                      backgroundColor: `hsl(${(360 / wheelParticipants.length) * i}, 70%, 60%)`
                    }}
                  >
                    <span className="wheel-name">{p.first_name}</span>
                  </div>
                ))}
              </div>
            </div>
            {winnerData && !spinning && (
              <div className="wheel-winner">
                🎉 Победитель: {winnerData.first_name} {winnerData.last_name}!
              </div>
            )}
            {!spinning && (
              <button onClick={() => setShowWheel(false)} className="btn-close-wheel">
                Закрыть
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;