const express = require('express');
const router = express.Router();
const { getLectureStats } = require('../controllers/statisticsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/lecture/:lectureId', authMiddleware, getLectureStats);

module.exports = router;
