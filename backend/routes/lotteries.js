const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Получить все розыгрыши
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM lotteries ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить розыгрыш по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM lotteries WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Розыгрыш не найден' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новый розыгрыш (админка)
router.post('/', async (req, res) => {
  try {
    const { title, description, prize, end_date } = req.body;
    
    const result = await pool.query(
      'INSERT INTO lotteries (title, description, prize, end_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, prize, end_date]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Выбрать победителя
router.post('/:id/select-winner', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем, что розыгрыш существует и активен
    const lottery = await pool.query('SELECT * FROM lotteries WHERE id = $1', [id]);
    if (lottery.rows.length === 0) {
      return res.status(404).json({ error: 'Розыгрыш не найден' });
    }
    if (lottery.rows[0].status !== 'active') {
      return res.status(400).json({ error: 'Розыгрыш уже завершён' });
    }
    
    // Получаем случайного участника
    const participants = await pool.query(
      'SELECT * FROM participants WHERE lottery_id = $1 ORDER BY RANDOM() LIMIT 1',
      [id]
    );
    
    if (participants.rows.length === 0) {
      return res.status(400).json({ error: 'Нет участников для выбора победителя' });
    }
    
    const winner = participants.rows[0];
    
    // Обновляем статус розыгрыша и записываем победителя
    await pool.query(
      'UPDATE lotteries SET status = $1, winner_id = $2 WHERE id = $3',
      ['finished', winner.vk_user_id, id]
    );
    
    res.json({ winner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Удалить розыгрыш (только админ)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM participants WHERE lottery_id = $1', [id]);
    await pool.query('DELETE FROM lotteries WHERE id = $1', [id]);
    
    res.json({ message: 'Розыгрыш удалён' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;