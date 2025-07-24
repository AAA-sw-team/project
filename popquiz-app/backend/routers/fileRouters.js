const fileController = require('../controllers/fileController');
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// 获取讲座已上传文件列表
router.get('/:lectureId', authMiddleware, fileController.getLectureFiles);

// 获取所有文件（需登录）
router.get('/all', authMiddleware, fileController.getAllFiles);

// 获取当前用户的所有文件
router.get('/speaker', authMiddleware, fileController.getUserFiles);

module.exports = router;
