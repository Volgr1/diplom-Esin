const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const initDB = require('./config/initDB');
const lotteriesRoutes = require('./routes/lotteries');
const participantsRoutes = require('./routes/participants');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

initDB();

app.use('/api/lotteries', lotteriesRoutes);
app.use('/api/participants', participantsRoutes);

// ========== VK ID АВТОРИЗАЦИЯ ==========
const REDIRECT_URI = 'https://lottery-diploma.vercel.app/auth/callback';

// Шаг 1: Отправляем пользователя на страницу VK
app.get('/api/auth/vk', (req, res) => {
  const vkAuthUrl = 'https://id.vk.com/authorize' +
    `?client_id=${process.env.VK_APP_ID}` +
    `&redirect_uri=${REDIRECT_URI}` +
    '&response_type=code' +
    '&scope=vkid.personal_info' +
    '&state=random123';
  res.redirect(vkAuthUrl);
});

// Шаг 2: VK возвращает code, мы меняем на токен и получаем данные
app.get('/api/auth/vk/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Код авторизации не получен' });
  }

  try {
    // Обмениваем code на access_token
    const tokenUrl = 'https://id.vk.com/oauth2/auth' +
      `?client_id=${process.env.VK_APP_ID}` +
      `&client_secret=${process.env.VK_CLIENT_SECRET}` +
      `&redirect_uri=${REDIRECT_URI}` +
      `&code=${code}` +
      '&grant_type=authorization_code';

    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description || 'Ошибка получения токена' });
    }

    // Получаем данные пользователя
    const userUrl = 'https://id.vk.com/oauth2/user_info' +
      `?client_id=${process.env.VK_APP_ID}` +
      `&access_token=${tokenData.access_token}`;

    const userResponse = await fetch(userUrl);
    const userData = await userResponse.json();

    if (userData.error) {
      return res.status(400).json({ error: userData.error_description || 'Ошибка получения пользователя' });
    }

    const user = userData.user;

    // Возвращаем данные пользователя
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage(
              ${JSON.stringify({
                id: user.user_id,
                first_name: user.first_name,
                last_name: user.last_name,
                photo: user.avatar
              })},
              '${REDIRECT_URI.replace('/auth/callback', '')}'
            );
            window.close();
          </script>
          <p>Авторизация прошла успешно! Окно можно закрыть.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'API сервиса розыгрышей работает!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});