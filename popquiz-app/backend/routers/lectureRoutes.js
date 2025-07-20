const express = require('express');
const router = express.Router();
const {
  createLecture,
  getAllLectures,
  getLecturesByUser,
  deleteLectureById
} = require('../models/lectureModel');
const authMiddleware = require('../middleware/authMiddleware');

// 创建讲座
router.post('/', authMiddleware, async (req, res) => {
  const { title, description } = req.body;
  const user = req.user;

  if (user.role !== 'speaker') {
    return res.status(403).json({ error: '只有讲者可以创建讲座' });
  }

  try {
    // userId 字段来自 token
    const [result] = await createLecture(title, description, user.userId);
    res.json({ message: '讲座创建成功', lectureId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库错误' });
  }
});

// 获取全部讲座
router.get('/', async (req, res) => {
  try {
    const [rows] = await getAllLectures();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: '获取讲座失败' });
  }
});

// 获取当前用户的讲座（需要登录）
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const [rows] = await getLecturesByUser(req.user.userId || req.user.id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: '获取我的讲座失败' });
  }
});

// 删除讲座
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await deleteLectureById(req.params.id, req.user.id|| req.user.userId);
    if (result.affectedRows === 0) {
      return res.status(403).json({ error: '不能删除不是你创建的讲座' });
    }
    res.json({ message: '讲座已删除' });
  } catch (err) {
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;
