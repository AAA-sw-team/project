const answerModel = require('../models/answerModel');
const quizModel = require('../models/quizzes');

// 听众提交答题
const submitAnswer = async (req, res) => {
  const userId = req.user.id;  // 通过 authMiddleware 获取
  const { quizId, selectedOption } = req.body;

  try {
    // 取出题目正确答案
    const [quizRows] = await quizModel.getQuizzesByLectureId(null); // 这里改为获取单题函数
    const [quiz] = await pool.promise().query('SELECT correct_option FROM quizzes WHERE id = ?', [quizId]);
    if (!quiz[0]) return res.status(404).json({ error: 'Quiz not found' });

    const isCorrect = quiz[0].correct_option.toUpperCase() === selectedOption.toUpperCase();

    await answerModel.saveAnswer(quizId, userId, selectedOption, isCorrect);

    res.json({ message: 'Answer saved', isCorrect });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save answer' });
  }
};

// 演讲者查看题目统计
const getQuizStatistics = async (req, res) => {
  const lectureId = req.params.lectureId;

  try {
    const [quizzes] = await quizModel.getQuizzesByLectureId(lectureId);

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

module.exports = {
  submitAnswer,
  getQuizStatistics,
  getUserAnswers
};
