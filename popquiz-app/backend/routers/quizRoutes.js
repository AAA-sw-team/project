
const express = require('express');
const router = express.Router();
const quizController= require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

// 生成题目（支持多文件/录音/count/group_id）
// POST /api/quizzes/generate/:id
router.post('/generate/:id', authMiddleware, quizController.generateQuiz);

// 批量发布题目
// POST /api/quizzes/publish/:id
router.post('/publish/:id', authMiddleware, quizController.publishQuizzes);

// 重新生成题目接口（先删后生成）
// POST /api/quizzes/:id/quizzes/regenerate
router.post('/:id/quizzes/regenerate', authMiddleware, quizController.RegenerateQuiz);

// 删除单个题目
// DELETE /api/quizzes/:quizId
router.delete('/:quizId', authMiddleware, quizController.deleteQuiz);

// 获取某讲座所有 quiz（含未发布）
// GET /api/quizzes/:lectureId
router.get('/:lectureId', quizController.getQuizzes);

module.exports = router;
