import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './LotteryDetail.css';

const API_URL = 'https://diplom-esin.onrender.com/api';

function LotteryDetail({ vkUser }) {
  const { id } = useParams();
  const [lottery, setLottery] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchLottery();
    fetchParticipants();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLottery = async () => {
    try {
      const res = await fetch(`${API_URL}/lotteries/${id}`);
      const data = await res.json();
      setLottery(data);
    } catch (error) {
      console.error('Ошибка загрузки розыгрыша:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const res = await fetch(`${API_URL}/participants/lottery/${id}`);
      const data = await res.json();
      setParticipants(data);
    } catch (error) {
      console.error('Ошибка загрузки участников:', error);
    }
  };

  const handleJoin = async () => {
    if (!vkUser) {
      setMessage('Сначала войдите через VK');
      return;
    }

    setJoining(true);
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/participants/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lottery_id: parseInt(id),
          vk_user_id: vkUser.id,
          first_name: vkUser.first_name,
          last_name: vkUser.last_name,
          photo: vkUser.photo
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Вы успешно участвуете в розыгрыше!');
        fetchParticipants();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Ошибка соединения с сервером');
    } finally {
      setJoining(false);
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
    return <div className="loading">Загрузка...</div>;
  }

  if (!lottery) {
    return <div className="loading">Розыгрыш не найден</div>;
  }

  const isActive = lottery.status === 'active';

  return (
    <div className="lottery-detail">
      <div className="lottery-info">
        <div className="lottery-status" data-status={lottery.status}>
          {isActive ? 'Активен' : 'Завершён'}
        </div>
        <h1 className="lottery-title">{lottery.title}</h1>
        <p className="lottery-prize">🏆 {lottery.prize}</p>
        {lottery.description && (
          <p className="lottery-desc">{lottery.description}</p>
        )}
        <p className="lottery-date">Завершение: {formatDate(lottery.end_date)}</p>

        {lottery.winner_id && (
          <div className="winner-block">
            🎉 Победитель: ID {lottery.winner_id}
          </div>
        )}

        {isActive && !lottery.winner_id && (
          <button
            className="btn-join"
            onClick={handleJoin}
            disabled={joining || !vkUser}
          >
            {joining ? 'Проверка...' : '🎯 Участвовать'}
          </button>
        )}

        {message && <p className="message">{message}</p>}

        {!vkUser && isActive && (
          <p className="hint">Войдите через VK, чтобы участвовать</p>
        )}
      </div>

      <div className="participants-section">
        <h2 className="participants-title">
          Участники ({participants.length})
        </h2>
        {participants.length === 0 ? (
          <p className="no-participants">Пока никто не участвует. Будьте первым!</p>
        ) : (
          <div className="participants-grid">
            {participants.map((p) => (
              <div key={p.id} className="participant-card">
                <img src={p.photo || 'https://vk.com/images/camera_100.png'} alt="" className="participant-avatar" />
                <span className="participant-name">{p.first_name} {p.last_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LotteryDetail;