const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { uploadLectureMedia } = require('../controllers/mediaController');
const lectureController = require('../controllers/lectureController');

router.use((req, res, next) => {
  console.log('Lecture route hit:', req.method, req.originalUrl);
  next();
});

// 获取当前用户的讲座（需要登录）- 必须放在 /:id 之前
router.get('/my', authMiddleware, lectureController.getLecturesByUser);

// 获取全部讲座
router.get('/', lectureController.getAllLectures);

// 获取讲座详情
router.get('/:id', authMiddleware, lectureController.getLectureDetail);

// 讲座录制内容上传接口（独立于讲座创建）
router.post('/:id/upload-media', authMiddleware, uploadLectureMedia);

// 创建讲座
router.post('/', authMiddleware, lectureController.createLecture);

// 开始讲座
router.post('/:id/start', authMiddleware, lectureController.startLecture);

// 结束讲座
router.post('/:id/end', authMiddleware, lectureController.endLecture);

// 重新开始讲座
router.post('/:id/restart', authMiddleware, lectureController.restartLecture);

// 删除讲座（删除了关联文件和相关题目）
router.delete('/:id', authMiddleware, lectureController.deleteLecture);

module.exports = router;
