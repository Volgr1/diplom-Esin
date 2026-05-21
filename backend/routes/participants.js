const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { checkIsMember, getUserInfo } = require('../services/vkApi');

// Получить участников розыгрыша
router.get('/lottery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM participants WHERE lottery_id = $1 ORDER BY joined_at DESC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Принять участие в розыгрыше
router.post('/join', async (req, res) => {
  try {
    const { lottery_id, vk_user_id, first_name, last_name, photo } = req.body;
    
    // Проверяем подписку через VK API
    const isMember = await checkIsMember(vk_user_id);
    if (!isMember) {
      return res.status(400).json({ 
        error: 'Вы не подписаны на сообщество. Подпишитесь, чтобы участвовать!' 
      });
    }
    
    // Проверяем, что розыгрыш активен
    const lottery = await pool.query('SELECT * FROM lotteries WHERE id = $1', [lottery_id]);
    if (lottery.rows.length === 0) {
      return res.status(404).json({ error: 'Розыгрыш не найден' });
    }
    if (lottery.rows[0].status !== 'active') {
      return res.status(400).json({ error: 'Розыгрыш уже завершён' });
    }
    
    // Проверяем, не участвует ли уже пользователь
    const existing = await pool.query(
      'SELECT * FROM participants WHERE lottery_id = $1 AND vk_user_id = $2',
      [lottery_id, vk_user_id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Вы уже участвуете в этом розыгрыше' });
    }
    
    // Добавляем участника
    const result = await pool.query(
      'INSERT INTO participants (lottery_id, vk_user_id, first_name, last_name, photo) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [lottery_id, vk_user_id, first_name, last_name, photo]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Получить победителя по vk_user_id
router.get('/winner/:vkUserId', async (req, res) => {
  try {
    const { vkUserId } = req.params;
    const result = await pool.query(
      'SELECT * FROM participants WHERE vk_user_id = $1 LIMIT 1',
      [vkUserId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Не найден' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;