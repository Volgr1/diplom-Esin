import React, { useState, useEffect } from 'react';
import './WinnersPage.css';

const API_URL = 'https://diplom-esin.onrender.com/api';

function WinnersPage() {
  const [lotteries, setLotteries] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/lotteries`)
      .then(r => r.json())
      .then(data => setLotteries(data.filter(l => l.status === 'finished')))
      .catch(console.error);
  }, []);

  return (
    <div className="info-page">
      <h1>🏆 Победители</h1>
      {lotteries.length === 0 ? (
        <p className="empty-text">Завершённых розыгрышей пока нет</p>
      ) : (
        <div className="winners-list">
          {lotteries.map(l => (
            <div key={l.id} className="winner-card">
              <h3>{l.title}</h3>
              <p>Приз: {l.prize}</p>
              <p>Победитель: ID {l.winner_id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WinnersPage;