const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 注册接口
exports.register = (req, res) => {
  const { username, password, role, nickname } = req.body;
  const hashed = bcrypt.hashSync(password, 10);

  db.query('INSERT INTO users (username, password, role, nickname) VALUES (?, ?, ?, ?)',
    [username, hashed, role || 'listener', nickname || username],
    (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: '注册成功！' });
    });
};

// 登录接口
exports.login = (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err || result.length === 0) return res.status(401).json({ error: '找不到用户' });

    const user = result[0];
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: '密码错误' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ message: '登录成功', token, role: user.role, nickname: user.nickname });
  });
};
