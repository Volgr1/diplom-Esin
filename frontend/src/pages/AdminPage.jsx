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
  const [spinning, setSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [winnerData, setWinnerData] = useState(null);
  const [participants, setParticipants] = useState([]);

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
        setTitle(''); setDescription(''); setPrize(''); setEndDate('');
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
      const parts = await res.json();

      if (parts.length === 0) {
        setMessage('❌ Нет участников');
        return;
      }

      setParticipants(parts);
      setShowWheel(true);
      setSpinning(true);
      setWinnerData(null);
      setCurrentIndex(0);

      let count = 0;
      const totalSteps = 20;
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % parts.length);
        count++;
        
        if (count >= totalSteps) {
          clearInterval(interval);
          
          fetch(`${API_URL}/lotteries/${lotteryId}/select-winner`, { method: 'POST' })
            .then(r => r.json())
            .then(result => {
              if (result.winner) {
                const winnerIdx = parts.findIndex(p => p.vk_user_id === result.winner.vk_user_id);
                setCurrentIndex(winnerIdx >= 0 ? winnerIdx : 0);
                setWinnerData(result.winner);
                setSpinning(false);
                fetchLotteries();
              }
            })
            .catch(() => {
              setSpinning(false);
            });
        }
      }, 200);
    } catch (error) {
      setMessage('❌ Ошибка');
    }
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
          <input type="text" placeholder="Название" value={title} onChange={e => setTitle(e.target.value)} required className="admin-input" />
          <input type="text" placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)} className="admin-input" />
          <input type="text" placeholder="Приз" value={prize} onChange={e => setPrize(e.target.value)} required className="admin-input" />
          <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required className="admin-input" />
          <button type="submit" className="btn-create">Создать</button>
        </form>
      </div>

      {message && <p className="admin-message">{message}</p>}

      <div className="admin-card">
        <h2 className="card-title">Управление</h2>
        {lotteries.length === 0 ? (
          <p className="empty-text">Пусто</p>
        ) : (
          <div className="admin-list">
            {lotteries.map(l => (
              <div key={l.id} className="admin-item">
                <div className="admin-item-info">
                  <span className="admin-item-title">{l.title}</span>
                  <span className="admin-item-prize">{l.prize}</span>
                  <span className={`admin-item-status status-${l.status}`}>{l.status === 'active' ? 'Активен' : 'Завершён'}</span>
                </div>
                {l.status === 'active' && (
                  <button className="btn-winner" onClick={() => handleSelectWinner(l.id)}>Выбрать победителя</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showWheel && (
        <div className="wheel-overlay" onClick={() => !spinning && setShowWheel(false)}>
          <div className="wheel-container" onClick={e => e.stopPropagation()}>
            <h2>{spinning ? '🎰 Выбираем...' : '🎉 Победитель!'}</h2>

            <div className="slot-machine">
              <div className={`slot-window ${spinning ? 'slot-spin' : ''}`}>
                {participants.length > 0 && (
                  <div className="slot-item">
                    <img 
                      src={participants[currentIndex]?.photo || 'https://vk.com/images/camera_100.png'} 
                      alt="" 
                      className="slot-avatar" 
                    />
                    <span className="slot-name">
                      {participants[currentIndex]?.first_name} {participants[currentIndex]?.last_name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="slot-participants">
              {participants.map((p, i) => (
                <div key={p.id} className={`slot-mini ${i === currentIndex && !spinning ? 'slot-active' : ''}`}>
                  <img src={p.photo || 'https://vk.com/images/camera_100.png'} alt="" />
                </div>
              ))}
            </div>

            {!spinning && winnerData && (
              <div className="wheel-result">
                <span>🏆 {winnerData.first_name} {winnerData.last_name}</span>
              </div>
            )}

            {!spinning && (
              <button className="btn-close-wheel" onClick={() => setShowWheel(false)}>Закрыть</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;