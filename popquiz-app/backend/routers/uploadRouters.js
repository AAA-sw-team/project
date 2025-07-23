const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const  handleUpload  = require('../controllers/uploadcontroller');

// 设置文件上传路径和命名
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 使用绝对路径，保证兼容各种启动目录，并自动创建目录
    const uploadDir = path.join(__dirname, '../../uploads');
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const userId = req.user?.id || req.user?.userId || 'unknown';
    const uniqueSuffix = Date.now();
    cb(null, `${userId}-${uniqueSuffix}-${file.originalname}`);
  }
});

console.log('[uploadRouters] 路由已加载，上传目录:', path.join(__dirname, '../../uploads'));
const upload = multer({ storage });


// 普通文件上传
router.post('/:lectureId',
  (req, res, next) => {
    console.log('[uploadRouters] 收到上传请求:', req.method, req.originalUrl);
    next();
  },
  authMiddleware,
  upload.single('file'),
  handleUpload.handleUpload
);

// 讲座录制内容上传（音频/视频）
router.post('/:lectureId/media',
  authMiddleware,
  upload.single('file'),
  handleUpload.uploadLectureMedia
);

module.exports = router;
