const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const answerController = require('../controllers/answerController');
const authMiddleware = require('../middleware/authMiddleware');

// 获取某讲座的已发布题目
// GET /api/quiz/lecture/:lectureId/published
router.get('/lecture/:lectureId/published', authMiddleware, quizController.getPublishedQuizzes);

// 获取用户在某讲座的答题记录
// GET /api/quiz/lecture/:lectureId/my-answers
router.get('/lecture/:lectureId/my-answers', authMiddleware, answerController.getUserAnswers);

// 提交答案
// POST /api/quiz/:quizId/answer
router.post('/:quizId/answer', authMiddleware, answerController.submitAnswer);

module.exports = router;
