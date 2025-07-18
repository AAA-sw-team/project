const express = require('express');
const multer = require('multer');
const { createQuiz, getQuizzesByLecture } = require('../models/quizzes');
const authMiddleware = require('../middleware/authMiddleware');
const mockGenerateQuiz = require('../utils/mockAiQuizGenerator');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/generate/:lectureId', authMiddleware, upload.single('file'), async (req, res) => {
  const { lectureId } = req.params;

  try {
    // 后面可以读取实际文本内容，现在用模拟内容
    const mockText = '人工智能是通过模拟人类思维...';
    const quizList = await mockGenerateQuiz(mockText);

    await createQuiz(lectureId, quizList);
    res.json({ message: '生成成功', quizCount: quizList.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '生成 quiz 失败' });
  }
});

// 获取某个讲座的所有 quiz
router.get('/lecture/:lectureId', authMiddleware, async (req, res) => {
  const { lectureId } = req.params;

  try {
    const [quizzes] = await getQuizzesByLecture(lectureId)
    res.json(quizzes)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '获取 quiz 失败' })
  }
});

// 答题功能
const pool = require('../models/db')

router.post('/answer', authMiddleware, async (req, res) => {
  const { quizId, selectedOption } = req.body;
  const userId = req.user.userId;

  try {
    // 查 correct_option
    const [rows] = await pool.promise().query(
      'SELECT correct_option FROM quizzes WHERE id = ?', [quizId]
    );

    if (rows.length === 0) return res.status(404).json({ error: '题目不存在' });

    const isCorrect = (selectedOption.toUpperCase() === rows[0].correct_option);

    await pool.promise().query(
      'INSERT INTO quiz_answers (user_id, quiz_id, selected_option, is_correct) VALUES (?, ?, ?, ?)',
      [userId, quizId, selectedOption.toUpperCase(), isCorrect]
    );

    res.json({ message: '答题成功', isCorrect });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '答题失败' });
  }
});

//答题统计接口
router.get('/stats/:lectureId', authMiddleware, async (req, res) => {
  const { lectureId } = req.params;

  try {
    const [stats] = await pool.promise().query(`
      SELECT q.id AS quiz_id, q.question, COUNT(a.id) AS total_answers,
        SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) AS correct_answers
      FROM quizzes q
      LEFT JOIN quiz_answers a ON q.id = a.quiz_id
      WHERE q.lecture_id = ?
      GROUP BY q.id
    `, [lectureId]);

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '统计失败' });
  }
});


module.exports = router;
