
const express = require('express');
const router = express.Router();
const fileModel = require('../models/fileModel');
const authMiddleware = require('../middleware/authMiddleware');

// 获取所有文件（需登录）
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const files = await fileModel.getAllFiles();
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: '获取所有文件失败' });
  }
});

// 获取当前用户的所有文件
router.get('/speaker', authMiddleware, async (req, res) => {
  try {
    const speakerId = req.user.id || req.user.userId;
    const files = await fileModel.getFilesByUserId(speakerId);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: '获取用户文件失败' });
  }
});

// 获取某讲座的所有文件
router.get('/lecture/:lectureId', authMiddleware, async (req, res) => {
  try {
    const lectureId = req.params.lectureId;
    const files = await fileModel.getFilesByLectureId(lectureId);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: '获取讲座文件失败' });
  }
});

module.exports = router;
