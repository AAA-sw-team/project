const express = require('express');
const router = express.Router();
const { generateQuiz, getQuizzes } = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const { handleUpload } = require('../controllers/quizController');




router.post('/generate/:lectureId', authMiddleware, generateQuiz);
router.get('/:lectureId', getQuizzes);


// 配置 multer 存储位置和文件名
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/upload/:lectureId', authMiddleware, upload.single('file'), handleUpload);



module.exports = router;
