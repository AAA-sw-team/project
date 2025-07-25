const db = require('../models/db');

// 获取所有用户
exports.getAllUsers = (req, res) => {
    if (!req.user || req.user.role !== 'organizer') {
        return res.status(403).json({ error: '无权限访问' });
    }
    db.query('SELECT id, username, nickname, role, created_at FROM users ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: '数据库错误' });
        res.json(results);
    });
}; 