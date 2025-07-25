const express = require('express');
const router = express.Router();
const { 
  submitAnswer, 
  getQuizStatistics, 
  getUserAnswers, 
  getUserAnswersByLectureAndUser,
  getAnswerLeaderboard
} = require('../controllers/answerController');
const authMiddleware = require('../middleware/authMiddleware');

// 提交答案 - 支持两种路由格式
router.post('/submit', authMiddleware, submitAnswer);
router.post('/:quizId/answer', authMiddleware, submitAnswer);

// 获取用户自己的答题记录
router.get('/lecture/:lectureId/my-answers', authMiddleware, getUserAnswers);

// 获取题目统计（讲师用）
router.get('/lecture/:lectureId/stats', authMiddleware, getQuizStatistics);

// 获取答题排行榜
router.get('/lecture/:lectureId/leaderboard', authMiddleware, getAnswerLeaderboard);

// 获取特定用户的答题记录（讲师用）
router.get('/lecture/:lectureId/user/:userId/answers', authMiddleware, getUserAnswersByLectureAndUser);

// 兼容旧的路由格式
router.get('/statistics/:lectureId', authMiddleware, getQuizStatistics);
router.get('/myanswers/:lectureId', authMiddleware, getUserAnswers);
router.get('/user/:userId/lecture/:lectureId', authMiddleware, getUserAnswersByLectureAndUser);

module.exports = router;
