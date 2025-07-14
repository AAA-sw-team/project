const express = require('express');
const router = express.Router();
const lectureModel = require('../models/lectureModel');
const authMiddleware = require('../middleware/authMiddleware');

// 创建讲座
router.post('/', authMiddleware, async (req, res) => {
  const { title, description } = req.body;
  const speakerId = req.user.userId;

  if (!title) return res.status(400).json({ error: '标题不能为空' });

  try {
    await lectureModel.createLecture(title, description, speakerId);
    res.json({ message: '讲座创建成功' });
  } catch (err) {
    res.status(500).json({ error: '创建失败' });
  }
});

// 获取所有讲座
router.get('/', async (req, res) => {
  try {
    const [lectures] = await lectureModel.getAllLectures();
    res.json(lectures);
  } catch (err) {
    res.status(500).json({ error: '获取讲座失败' });
  }
});

// 获取自己创建的讲座
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const [lectures] = await lectureModel.getLecturesByUser(req.user.userId);
    res.json(lectures);
  } catch (err) {
    res.status(500).json({ error: '获取失败' });
  }
});

// 删除讲座
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await lectureModel.deleteLectureById(req.params.id, req.user.userId);
    if (result.affectedRows === 0) return res.status(403).json({ error: '你不能删除这个讲座' });
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;
