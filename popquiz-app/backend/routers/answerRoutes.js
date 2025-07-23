const express = require('express');
const router = express.Router();
const { 
  submitAnswer, 
  getPublishedQuizGroups,
  getQuizGroupDetail,
  getQuizGroupStatistics,
  getQuizGroupReview,
  getQuizStatistics, 
  getUserAnswers 
} = require('../controllers/answerController');
const authMiddleware = require('../middleware/authMiddleware');

// 听众提交答案
router.post('/submit', authMiddleware, submitAnswer);

// 获取讲座的已发布题目组列表
router.get('/quiz-groups/:lectureId', authMiddleware, getPublishedQuizGroups);

// 获取单个题目组的详情（用于答题）
router.get('/quiz-group/:lectureId/:groupId', authMiddleware, getQuizGroupDetail);

// 获取题目组的答题统计
router.get('/quiz-group/:lectureId/:groupId/statistics', authMiddleware, getQuizGroupStatistics);

// 获取题目组的答案回顾
router.get('/quiz-group/:lectureId/:groupId/review', authMiddleware, getQuizGroupReview);

// 演讲者查看题目统计（原功能保留）
router.get('/statistics/:lectureId', authMiddleware, getQuizStatistics);

// 听众查看自己的答题记录（原功能保留）
router.get('/myanswers/:lectureId', authMiddleware, getUserAnswers);

module.exports = router;
