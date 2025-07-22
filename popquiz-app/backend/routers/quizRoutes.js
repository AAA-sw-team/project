const express = require('express');
const router = express.Router();
const { generateQuiz, getQuizzes/*, publishQuizzes*/ } = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

//生成题目
router.post('/generate/:lectureId', authMiddleware, generateQuiz);
// 批量发布题目
//router.post('/publish', authMiddleware, publishQuizzes);
// 获取某讲座已发布的所有题目
router.get('/:lectureId', getQuizzes);

module.exports = router;
