const express = require('express');
const router = express.Router();
const DiscussionController = require('../controllers/discussionController');
const authMiddleware = require('../middleware/authMiddleware');

// 发送消息
router.post('/lecture/:lectureId/message', authMiddleware, DiscussionController.sendMessage);

// 获取所有讨论消息（初始加载）
router.get('/lecture/:lectureId/messages', authMiddleware, DiscussionController.getAllMessages);

// 获取新消息（用于轮询）
router.get('/lecture/:lectureId/new-messages', authMiddleware, DiscussionController.getNewMessages);

// 获取最新消息ID（用于轮询检查）
router.get('/lecture/:lectureId/latest-id', authMiddleware, DiscussionController.getLatestMessageId);

// 点赞/取消点赞消息
router.post('/message/:discussionId/like', authMiddleware, DiscussionController.toggleLike);

// 置顶/取消置顶消息（仅讲师）
router.post('/lecture/:lectureId/message/:discussionId/pin', authMiddleware, DiscussionController.togglePin);

// 删除消息
router.delete('/lecture/:lectureId/message/:discussionId', authMiddleware, DiscussionController.deleteMessage);

// 获取讨论统计（仅讲师）
router.get('/lecture/:lectureId/stats', authMiddleware, DiscussionController.getDiscussionStats);

// 发送公告（仅讲师）
router.post('/lecture/:lectureId/announcement', authMiddleware, DiscussionController.sendAnnouncement);

module.exports = router;
