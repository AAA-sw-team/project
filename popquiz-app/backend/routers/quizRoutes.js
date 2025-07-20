const express = require('express');
const router = express.Router();
const { generateQuiz, getQuizzes } = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/generate/:lectureId', authMiddleware, generateQuiz);
router.get('/:lectureId', getQuizzes);

module.exports = router;
