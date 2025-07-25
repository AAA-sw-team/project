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
  const { username, password, role } = req.body; // 增加 role
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err || result.length === 0) return res.status(401).json({ error: '找不到用户' });

    const user = result[0];
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: '密码错误' });

    // 新增：校验角色
    if (role && user.role !== role) {
      return res.status(403).json({ error: '身份与账号不符，请选择正确的身份' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role, name: user.nickname }, process.env.JWT_SECRET, { expiresIn: '3h' });
    res.json({ message: '登录成功', token, role: user.role, nickname: user.nickname });
  });
};
