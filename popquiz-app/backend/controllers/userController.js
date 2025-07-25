const db = require('../models/db');

// ��ȡ�����û�
exports.getAllUsers = (req, res) => {
    if (!req.user || req.user.role !== 'organizer') {
        return res.status(403).json({ error: '��Ȩ�޷���' });
    }
    db.query('SELECT id, username, nickname, role, created_at FROM users ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: '���ݿ����' });
        res.json(results);
    });
}; 