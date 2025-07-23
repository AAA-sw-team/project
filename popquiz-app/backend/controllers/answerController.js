const answerModel = require('../models/answerModel');
const quizModel = require('../models/quizzes');
const pool = require('../models/db');

// 听众提交答题
const submitAnswer = async (req, res) => {
  const userId = req.user.userId || req.user.id;  // 通过 authMiddleware 获取
  const { quizId, selectedOption } = req.body;

  try {
    // 检查用户权限（必须是听众且已加入讲座）
    const [quizInfo] = await pool.promise().query(
      'SELECT lecture_id, correct_option FROM quizzes WHERE id = ?', 
      [quizId]
    );
    
    if (!quizInfo.length) {
      return res.status(404).json({ error: '题目不存在' });
    }

    const quiz = quizInfo[0];
    
    // 检查用户是否已加入该讲座
    const [participantCheck] = await pool.promise().query(
      'SELECT * FROM lecture_participants WHERE lecture_id = ? AND user_id = ? AND status = "joined"',
      [quiz.lecture_id, userId]
    );
    
    if (!participantCheck.length) {
      return res.status(403).json({ error: '您需要先加入讲座才能答题' });
    }

    // 检查是否已经答过这道题
    const [existingAnswer] = await pool.promise().query(
      'SELECT * FROM quiz_answers WHERE quiz_id = ? AND user_id = ?',
      [quizId, userId]
    );

    if (existingAnswer.length > 0) {
      return res.status(400).json({ error: '您已经回答过这道题目了' });
    }

    const isCorrect = quiz.correct_option.toUpperCase() === selectedOption.toUpperCase();

    await answerModel.saveAnswer(quizId, userId, selectedOption, isCorrect);

    res.json({ 
      message: '答案已保存', 
      isCorrect,
      correctOption: quiz.correct_option
    });
  } catch (err) {
    console.error('[answerController] 提交答案失败:', err);
    res.status(500).json({ error: '提交答案失败' });
  }
};

// 获取已发布的题目组供听众答题
const getPublishedQuizGroups = async (req, res) => {
  const lectureId = req.params.lectureId;
  const userId = req.user.userId || req.user.id;

  try {
    // 检查用户是否已加入讲座
    const [participantCheck] = await pool.promise().query(
      'SELECT * FROM lecture_participants WHERE lecture_id = ? AND user_id = ? AND status = "joined"',
      [lectureId, userId]
    );
    
    if (!participantCheck.length) {
      return res.status(403).json({ error: '您需要先加入讲座才能查看题目' });
    }

    // 获取已发布的题目，按group_id分组
    const [quizzes] = await pool.promise().query(
      `SELECT id, question, option_a, option_b, option_c, option_d, group_id, created_at
       FROM quizzes 
       WHERE lecture_id = ? AND published = 1 
       ORDER BY group_id, created_at ASC`,
      [lectureId]
    );

    // 按group_id分组
    const groupedQuizzes = {};
    quizzes.forEach(quiz => {
      const groupId = quiz.group_id || 'default';
      if (!groupedQuizzes[groupId]) {
        groupedQuizzes[groupId] = {
          group_id: groupId,
          quizzes: [],
          total_count: 0
        };
      }
      
      groupedQuizzes[groupId].quizzes.push({
        id: quiz.id,
        question: quiz.question,
        options: {
          A: quiz.option_a,
          B: quiz.option_b,
          C: quiz.option_c,
          D: quiz.option_d
        },
        created_at: quiz.created_at
      });
      groupedQuizzes[groupId].total_count++;
    });

    // 获取用户的答题进度
    const [userAnswers] = await pool.promise().query(
      `SELECT qa.quiz_id, qa.selected_option, qa.is_correct, q.group_id
       FROM quiz_answers qa
       JOIN quizzes q ON qa.quiz_id = q.id  
       WHERE q.lecture_id = ? AND qa.user_id = ?`,
      [lectureId, userId]
    );

    // 计算每组的答题进度
    const answerProgress = {};
    userAnswers.forEach(answer => {
      const groupId = answer.group_id || 'default';
      if (!answerProgress[groupId]) {
        answerProgress[groupId] = {
          answered_count: 0,
          correct_count: 0,
          quiz_ids: []
        };
      }
      answerProgress[groupId].answered_count++;
      if (answer.is_correct) answerProgress[groupId].correct_count++;
      answerProgress[groupId].quiz_ids.push(answer.quiz_id);
    });

    // 组合结果
    const result = Object.values(groupedQuizzes).map(group => ({
      group_id: group.group_id,
      total_count: group.total_count,
      answered_count: answerProgress[group.group_id]?.answered_count || 0,
      correct_count: answerProgress[group.group_id]?.correct_count || 0,
      is_completed: (answerProgress[group.group_id]?.answered_count || 0) === group.total_count,
      quizzes: group.quizzes
    }));

    res.json(result);
  } catch (err) {
    console.error('[answerController] 获取题目组失败:', err);
    res.status(500).json({ error: '获取题目组失败' });
  }
};

// 获取单个题目组的详情（用于答题界面）
const getQuizGroupDetail = async (req, res) => {
  const { lectureId, groupId } = req.params;
  const userId = req.user.userId || req.user.id;

  try {
    // 检查用户是否已加入讲座
    const [participantCheck] = await pool.promise().query(
      'SELECT * FROM lecture_participants WHERE lecture_id = ? AND user_id = ? AND status = "joined"',
      [lectureId, userId]
    );
    
    if (!participantCheck.length) {
      return res.status(403).json({ error: '您需要先加入讲座才能答题' });
    }

    // 获取题目组的所有题目
    const [quizzes] = await pool.promise().query(
      `SELECT id, question, option_a, option_b, option_c, option_d, created_at
       FROM quizzes 
       WHERE lecture_id = ? AND group_id = ? AND published = 1 
       ORDER BY created_at ASC`,
      [lectureId, groupId]
    );

    if (!quizzes.length) {
      return res.status(404).json({ error: '题目组不存在或尚未发布' });
    }

    // 获取用户已答题目
    const [userAnswers] = await pool.promise().query(
      `SELECT qa.quiz_id, qa.selected_option, qa.is_correct, qa.answered_at
       FROM quiz_answers qa
       JOIN quizzes q ON qa.quiz_id = q.id  
       WHERE q.lecture_id = ? AND q.group_id = ? AND qa.user_id = ?`,
      [lectureId, groupId, userId]
    );

    // 创建答案映射
    const answersMap = {};
    userAnswers.forEach(answer => {
      answersMap[answer.quiz_id] = {
        selected_option: answer.selected_option,
        is_correct: answer.is_correct,
        answered_at: answer.answered_at
      };
    });

    // 组合题目和答案信息
    const quizzesWithAnswers = quizzes.map(quiz => ({
      id: quiz.id,
      question: quiz.question,
      options: {
        A: quiz.option_a,
        B: quiz.option_b,
        C: quiz.option_c,
        D: quiz.option_d
      },
      user_answer: answersMap[quiz.id] || null,
      created_at: quiz.created_at
    }));

    const answeredCount = Object.keys(answersMap).length;
    const totalCount = quizzes.length;
    const correctCount = userAnswers.filter(answer => answer.is_correct).length;

    const result = {
      group_id: groupId,
      lecture_id: parseInt(lectureId),
      total_count: totalCount,
      answered_count: answeredCount,
      correct_count: correctCount,
      is_completed: answeredCount === totalCount,
      accuracy: answeredCount > 0 ? (correctCount / answeredCount * 100) : 0,
      quizzes: quizzesWithAnswers
    };

    res.json(result);
  } catch (err) {
    console.error('[answerController] 获取题目组详情失败:', err);
    res.status(500).json({ error: '获取题目组详情失败' });
  }
};

// 获取题目组的答案回顾（逐题查看正确答案）
const getQuizGroupReview = async (req, res) => {
  const { lectureId, groupId } = req.params;
  const userId = req.user.userId || req.user.id;

  try {
    // 检查用户是否已加入讲座
    const [participantCheck] = await pool.promise().query(
      'SELECT * FROM lecture_participants WHERE lecture_id = ? AND user_id = ? AND status = "joined"',
      [lectureId, userId]
    );
    
    if (!participantCheck.length) {
      return res.status(403).json({ error: '您需要先加入讲座才能查看答案' });
    }

    // 获取题目组的所有题目及正确答案
    const [quizzes] = await pool.promise().query(
      `SELECT 
        q.id, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.created_at,
        qa.selected_option, qa.is_correct, qa.answered_at
       FROM quizzes q
       LEFT JOIN quiz_answers qa ON q.id = qa.quiz_id AND qa.user_id = ?
       WHERE q.lecture_id = ? AND q.group_id = ? AND q.published = 1
       ORDER BY q.created_at ASC`,
      [userId, lectureId, groupId]
    );

    if (!quizzes.length) {
      return res.status(404).json({ error: '题目组不存在' });
    }

    // 格式化返回数据
    const reviewData = quizzes.map((quiz, index) => ({
      quiz_number: index + 1,
      id: quiz.id,
      question: quiz.question,
      options: {
        A: quiz.option_a,
        B: quiz.option_b,
        C: quiz.option_c,
        D: quiz.option_d
      },
      correct_option: quiz.correct_option,
      user_answer: quiz.answered_at ? {
        selected_option: quiz.selected_option,
        is_correct: quiz.is_correct,
        answered_at: quiz.answered_at
      } : null,
      created_at: quiz.created_at
    }));

    // 计算基础统计
    const answeredCount = reviewData.filter(q => q.user_answer !== null).length;
    const correctCount = reviewData.filter(q => q.user_answer && q.user_answer.is_correct).length;

    const result = {
      group_id: groupId,
      lecture_id: parseInt(lectureId),
      total_count: reviewData.length,
      answered_count: answeredCount,
      correct_count: correctCount,
      accuracy: answeredCount > 0 ? Math.round((correctCount / answeredCount) * 10000) / 100 : 0,
      quizzes: reviewData
    };

    res.json(result);
  } catch (err) {
    console.error('[answerController] 获取题目组回顾失败:', err);
    res.status(500).json({ error: '获取题目组回顾失败' });
  }
};

// 演讲者查看题目统计（保留原功能）
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

// 获取题目组的统计信息（讲师端使用）
const getQuizGroupStatistics = async (req, res) => {
  const { lectureId, groupId } = req.params;

  try {
    // 获取题目组的所有题目
    const [quizzes] = await pool.promise().query(
      `SELECT id, question, correct_option, created_at
       FROM quizzes 
       WHERE lecture_id = ? AND group_id = ? AND published = 1 
       ORDER BY created_at ASC`,
      [lectureId, groupId]
    );

    if (!quizzes.length) {
      return res.status(404).json({ error: '题目组不存在或尚未发布' });
    }

    // 获取所有答题统计
    const [answerStats] = await pool.promise().query(
      `SELECT 
        q.id as quiz_id,
        q.question,
        q.correct_option,
        COUNT(qa.id) as total_answers,
        SUM(qa.is_correct) as correct_answers,
        COUNT(CASE WHEN qa.selected_option = 'A' THEN 1 END) as option_a_count,
        COUNT(CASE WHEN qa.selected_option = 'B' THEN 1 END) as option_b_count,
        COUNT(CASE WHEN qa.selected_option = 'C' THEN 1 END) as option_c_count,
        COUNT(CASE WHEN qa.selected_option = 'D' THEN 1 END) as option_d_count
       FROM quizzes q
       LEFT JOIN quiz_answers qa ON q.id = qa.quiz_id
       WHERE q.lecture_id = ? AND q.group_id = ? AND q.published = 1
       GROUP BY q.id, q.question, q.correct_option
       ORDER BY q.created_at ASC`,
      [lectureId, groupId]
    );

    // 获取参与者总数
    const [participantCount] = await pool.promise().query(
      'SELECT COUNT(*) as total FROM lecture_participants WHERE lecture_id = ? AND status = "joined"',
      [lectureId]
    );

    const totalParticipants = participantCount[0]?.total || 0;

    // 格式化统计数据
    const quizStats = answerStats.map(stat => ({
      quiz_id: stat.quiz_id,
      question: stat.question,
      correct_option: stat.correct_option,
      total_answers: stat.total_answers,
      correct_answers: stat.correct_answers,
      accuracy: stat.total_answers > 0 ? Math.round((stat.correct_answers / stat.total_answers) * 10000) / 100 : 0,
      participation_rate: totalParticipants > 0 ? Math.round((stat.total_answers / totalParticipants) * 10000) / 100 : 0,
      option_distribution: {
        A: stat.option_a_count,
        B: stat.option_b_count,
        C: stat.option_c_count,
        D: stat.option_d_count
      }
    }));

    // 计算整体统计
    const totalAnswers = quizStats.reduce((sum, quiz) => sum + quiz.total_answers, 0);
    const totalCorrect = quizStats.reduce((sum, quiz) => sum + quiz.correct_answers, 0);
    const averageAccuracy = quizStats.length > 0 
      ? Math.round((quizStats.reduce((sum, quiz) => sum + quiz.accuracy, 0) / quizStats.length) * 100) / 100 
      : 0;

    const result = {
      group_id: groupId,
      lecture_id: parseInt(lectureId),
      total_participants: totalParticipants,
      quiz_count: quizzes.length,
      total_answers: totalAnswers,
      total_correct: totalCorrect,
      overall_accuracy: totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 10000) / 100 : 0,
      average_accuracy: averageAccuracy,
      quiz_statistics: quizStats
    };

    res.json(result);
  } catch (err) {
    console.error('[answerController] 获取题目组统计失败:', err);
    res.status(500).json({ error: '获取题目组统计失败' });
  }
};

// 听众查看自己的答题记录（保留原功能）
const getUserAnswers = async (req, res) => {
  const userId = req.user.userId || req.user.id;
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
  getPublishedQuizGroups,
  getQuizGroupDetail,
  getQuizGroupStatistics,
  getQuizGroupReview,
  getQuizStatistics,
  getUserAnswers
};
