const answerModel = require('../models/answerModel');
const quizModel = require('../models/quizzes');
const pool = require('../models/db');

// 听众提交答题
const submitAnswer = async (req, res) => {
  const userId = req.user.id;  // 通过 authMiddleware 获取
  const { quizId, selectedOption, answer } = req.body;
  
  // 支持两种参数格式
  const userAnswer = answer || selectedOption;

  try {
    // 获取题目信息
    const [quiz] = await pool.promise().query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
    if (!quiz[0]) return res.status(404).json({ error: 'Quiz not found' });

    const isCorrect = quiz[0].correct_option.toUpperCase() === userAnswer.toUpperCase();

    console.log('提交答题:', {
      userId,
      quizId,
      userAnswer,
      correctOption: quiz[0].correct_option,
      isCorrect,
      lectureId: quiz[0].lecture_id
    });

    // 使用兼容的 saveAnswer 函数
    await answerModel.saveAnswer(quizId, userId, userAnswer, isCorrect);

    res.json({ 
      success: true,
      message: 'Answer saved', 
      isCorrect,
      correctAnswer: quiz[0].correct_option
    });
  } catch (err) {
    console.error('答题保存失败:', err);
    res.status(500).json({ error: 'Failed to save answer' });
  }
};

// 演讲者查看题目统计
const getQuizStatistics = async (req, res) => {
  const lectureId = req.params.lectureId;

  try {
    const quizzes = await quizModel.getQuizzes(lectureId);

    const results = [];
    for (const quiz of quizzes) {
      const stats = await answerModel.getQuizStats(quiz.id);
      results.push({
        quizId: quiz.id,
        question: quiz.question,
        totalAnswers: stats.total_answers || 0,
        correctAnswers: stats.correct_answers || 0,
        accuracy: stats.total_answers ? (stats.correct_answers / stats.total_answers) : 0
      });
    }
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
};

// 听众查看自己的答题记录
const getUserAnswers = async (req, res) => {
  const userId = req.user.id;
  const lectureId = req.params.lectureId;

  try {
    const [rows] = await answerModel.getUserAnswersByLecture(lectureId, userId);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get user answers' });
  }
};

// 演讲者查看特定用户的答题记录
const getUserAnswersByLectureAndUser = async (req, res) => {
  const lectureId = req.params.lectureId;
  const userId = req.params.userId;

  try {
    const [rows] = await answerModel.getUserAnswersByLecture(lectureId, userId);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get user answers' });
  }
};

// 获取答题排行榜
const getAnswerLeaderboard = async (req, res) => {
  const lectureId = req.params.lectureId;
  const limit = req.query.limit || 10;

  try {
    const leaderboard = await answerModel.getAnswerLeaderboard(lectureId, limit);
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (err) {
    console.error('Error getting leaderboard:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get leaderboard' 
    });
  }
};

module.exports = {
  submitAnswer,
  getQuizStatistics,
  getUserAnswers,
  getUserAnswersByLectureAndUser,
  getAnswerLeaderboard
};
