const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');
const authMiddleware = require('../middleware/authMiddleware');

// 听众加入讲座
router.post('/join/:lectureId', authMiddleware, participantController.joinLecture);

// 听众退出讲座
router.post('/leave/:lectureId', authMiddleware, participantController.leaveLecture);

// 获取用户加入的所有讲座
router.get('/my-lectures', authMiddleware, participantController.getMyJoinedLectures);

// 获取用户参与的已结束讲座列表
router.get('/finished-lectures', authMiddleware, participantController.getFinishedLectures);

// 查看已结束讲座的详细复习信息
router.get('/lecture-review/:lectureId', authMiddleware, participantController.getLectureReview);

// 获取讲座的参与者列表（仅讲座创建者）
router.get('/lecture/:lectureId', authMiddleware, participantController.getLectureParticipants);

// 检查用户是否已加入讲座
router.get('/check/:lectureId', authMiddleware, participantController.checkJoinStatus);

// 检查用户是否曾经加入过讲座（历史记录）
router.get('/check-history/:lectureId', authMiddleware, participantController.checkHasEverJoined);

// 获取讲座参与者数量（公开接口）
router.get('/count/:lectureId', participantController.getLectureParticipantCount);

// 更新用户心跳（保持在线状态）
router.post('/heartbeat/:lectureId', authMiddleware, participantController.updateHeartbeat);

module.exports = router;
