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

// 获取当前用户信息
exports.getCurrentUser = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: '未登录' });
    }
    // req.user 里通常有 userId/role/name
    const userId = req.user.userId || req.user.id;
    const role = req.user.role;
    // 从数据库查更全信息
    const sql = 'SELECT id, username, nickname, role FROM users WHERE id = ? LIMIT 1';
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: '数据库错误' });
        if (!results || results.length === 0) return res.status(404).json({ error: '用户不存在' });
        res.json(results[0]);
    });
}; 