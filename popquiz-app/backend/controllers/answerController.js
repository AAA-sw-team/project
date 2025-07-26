const answerModel = require('../models/answerModel');
const quizModel = require('../models/quizzes');
const pool = require('../models/db');

// 听众提交答题
const submitAnswer = async (req, res) => {
  // 调试信息
  console.log('req.user:', req.user);
  console.log('req.params:', req.params);
  console.log('req.body:', req.body);
  
  const userId = req.user?.userId || req.user?.id;  // 兼容两种格式
  const quizId = req.params.quizId; // 从 URL 参数获取
  const { selectedOption, answer } = req.body;
  
  // 验证用户ID
  if (!userId) {
    console.error('用户ID为空，req.user:', req.user);
    return res.status(401).json({ error: '用户身份验证失败，请重新登录' });
  }
  
  // 支持两种参数格式
  const userAnswer = answer || selectedOption;

  try {
    // 获取题目信息
    const [quiz] = await pool.promise().query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
    if (!quiz[0]) return res.status(404).json({ error: 'Quiz not found' });

    const quizData = quiz[0];
    
    // 将用户选择的完整选项内容映射为选项字母
    let selectedOptionLetter = '';
    const options = {
      'A': quizData.option_a,
      'B': quizData.option_b,
      'C': quizData.option_c,
      'D': quizData.option_d
    };
    
    // 查找用户答案对应的选项字母
    for (const [letter, content] of Object.entries(options)) {
      if (content === userAnswer) {
        selectedOptionLetter = letter;
        break;
      }
    }
    
    // 如果没找到匹配的选项，可能用户直接选择了字母
    if (!selectedOptionLetter && ['A', 'B', 'C', 'D'].includes(userAnswer.toUpperCase())) {
      selectedOptionLetter = userAnswer.toUpperCase();
    }
    
    // 如果仍然没找到，使用默认值并记录警告
    if (!selectedOptionLetter) {
      console.warn('无法映射用户答案到选项字母:', userAnswer);
      selectedOptionLetter = 'A'; // 默认值
    }

    const isCorrect = selectedOptionLetter === quizData.correct_option.toUpperCase();

    console.log('提交答题:', {
      userId,
      quizId,
      userAnswer,
      selectedOptionLetter,
      correctOption: quizData.correct_option,
      isCorrect,
      lectureId: quizData.lecture_id
    });

    // 使用选项字母而不是完整内容保存
    await answerModel.saveAnswer(quizId, userId, selectedOptionLetter, isCorrect);

    res.json({ 
      success: true,
      message: 'Answer saved', 
      isCorrect,
      correctAnswer: quizData.correct_option,
      selectedOption: selectedOptionLetter
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
  // 调试信息
  console.log('getUserAnswers - req.user:', req.user);
  
  const userId = req.user?.userId || req.user?.id;  // 兼容两种格式
  const lectureId = req.params.lectureId;
  
  console.log('getUserAnswers - userId:', userId, 'lectureId:', lectureId);
  
  if (!userId) {
    console.error('getUserAnswers - 用户ID为空');
    return res.status(401).json({ error: '用户身份验证失败' });
  }

  try {
    const answers = await answerModel.getUserAnswersByLecture(lectureId, userId);
    console.log('getUserAnswers - 查询结果:', answers?.length, '条记录');
    // 统计信息兼容 user_quiz_stats 视图
    const statsRow = await answerModel.getUserQuizStats(lectureId, userId);
    // 兜底：如果 user_quiz_stats 没有数据，则用 answers 计算
    const stats = statsRow && statsRow.total_questions > 0 ? statsRow : {
      total_questions: answers.length,
      correct_answers: answers.filter(a => a.is_correct).length,
      accuracy_rate: answers.length > 0 ? Math.round((answers.filter(a => a.is_correct).length / answers.length) * 100) : 0,
      groups_participated: 0,
      avg_answer_time_ms: null
    };
    res.json({
      success: true,
      data: {
        answers: answers,
        stats: stats
      }
    });
  } catch (err) {
    console.error('getUserAnswers - 错误:', err);
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
    // 确保每个对象都包含 user_id、accuracy_rate、total_questions 字段
    const strictLeaderboard = leaderboard.map(item => ({
      user_id: item.user_id,
      accuracy_rate: item.accuracy_rate ?? 0,
      total_questions: item.total_questions ?? 0,
      // 其他字段可以根据需要保留或删除
      username: item.username,
      nickname: item.nickname,
      correct_answers: item.correct_answers ?? 0,
      avg_answer_time_ms: item.avg_answer_time_ms ?? null
    }));
    res.json({
      success: true,
      data: strictLeaderboard
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
