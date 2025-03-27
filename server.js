const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Хранение пользователей в памяти
const users = [];

// Middleware для проверки JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Регистрация
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Проверка существующего пользователя
    if (users.find(user => user.username === username)) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание нового пользователя
    const user = {
      id: users.length + 1,
      username,
      password: hashedPassword
    };

    users.push(user);

    res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Вход
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Поиск пользователя
    const user = users.find(user => user.username === username);
    if (!user) {
      return res.status(400).json({ message: 'Пользователь не найден' });
    }

    // Проверка пароля
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Неверный пароль' });
    }

    // Создание JWT токена
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Защищенный маршрут
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'Это защищенный маршрут',
    user: req.user
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 