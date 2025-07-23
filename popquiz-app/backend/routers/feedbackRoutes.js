const express = require('express');
const router = express.Router();
const FeedbackController = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/authMiddleware');

// 获取反馈类型列表
router.get('/types', authMiddleware, FeedbackController.getFeedbackTypes);

// 提交反馈（听众）
router.post('/lecture/:lectureId', authMiddleware, FeedbackController.submitFeedback);

// 获取用户在特定讲座的反馈历史（听众）
router.get('/lecture/:lectureId/my-history', authMiddleware, FeedbackController.getUserFeedbackHistory);

// 获取讲座的所有反馈（讲师）
router.get('/lecture/:lectureId/all', authMiddleware, FeedbackController.getLectureFeedback);

// 获取讲座反馈统计（讲师）
router.get('/lecture/:lectureId/stats', authMiddleware, FeedbackController.getLectureFeedbackStats);

// 获取实时反馈概览（讲师）
router.get('/lecture/:lectureId/realtime', authMiddleware, FeedbackController.getRealtimeFeedbackOverview);

module.exports = router;
