const express = require('express');
const router = express.Router();
const { submitAnswer, getQuizStatistics, getUserAnswers } = require('../controllers/answerController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/submit', authMiddleware, submitAnswer);
router.get('/statistics/:lectureId', authMiddleware, getQuizStatistics);
router.get('/myanswers/:lectureId', authMiddleware, getUserAnswers);

module.exports = router;
