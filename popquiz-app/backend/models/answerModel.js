const pool = require('./db');

/**
 * 保存用户答题记录 - 新版本(对象参数)
 * @param {Object} answerData - 答题数据
 * @param {number} answerData.quizId - 题目ID
 * @param {number} answerData.userId - 用户ID
 * @param {number} answerData.lectureId - 讲座ID
 * @param {string} answerData.userAnswer - 用户答案内容
 * @param {string} answerData.selectedOption - 选择的选项(A/B/C/D)
 * @param {string} answerData.correctAnswer - 正确答案内容
 * @param {string} answerData.correctOption - 正确选项(A/B/C/D)
 * @param {boolean} answerData.isCorrect - 是否正确
 * @param {number} answerData.answerTimeMs - 答题用时(毫秒)
 * @param {string} answerData.groupId - 题目组ID
 */
const saveAnswerNew = async (answerData) => {
  const {
    quizId, userId, lectureId, userAnswer, selectedOption,
    correctAnswer, correctOption, isCorrect, answerTimeMs, groupId
  } = answerData;

  return pool.promise().query(
    `INSERT INTO quiz_answers (
      quiz_id, user_id, lecture_id, user_answer, selected_option,
      correct_answer, correct_option, is_correct, answer_time_ms, group_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      user_answer = VALUES(user_answer),
      selected_option = VALUES(selected_option),
      is_correct = VALUES(is_correct),
      answer_time_ms = VALUES(answer_time_ms),
      submit_count = submit_count + 1,
      updated_at = CURRENT_TIMESTAMP`,
    [quizId, userId, lectureId, userAnswer, selectedOption, 
     correctAnswer, correctOption, isCorrect ? 1 : 0, answerTimeMs, groupId]
  );
};

/**
 * 保存用户答题记录 - 旧版本(单独参数，兼容现有代码)
 * @param {number} quizId - 题目ID
 * @param {number} userId - 用户ID
 * @param {string} selectedOption - 选择的选项
 * @param {boolean} isCorrect - 是否正确
 */
const saveAnswer = async (quizId, userId, selectedOption, isCorrect) => {
  // 获取题目信息来填充缺失的字段
  const [quizRows] = await pool.promise().query(
    'SELECT lecture_id, question, option_a, option_b, option_c, option_d, correct_option, group_id FROM quizzes WHERE id = ?',
    [quizId]
  );
  
  if (!quizRows[0]) {
    throw new Error('Quiz not found');
  }
  
  const quiz = quizRows[0];
  const userAnswer = selectedOption; // 简化处理，直接使用选项
  
  return pool.promise().query(
    `INSERT INTO quiz_answers (
      quiz_id, user_id, lecture_id, user_answer, selected_option,
      correct_answer, correct_option, is_correct, answer_time_ms, group_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      user_answer = VALUES(user_answer),
      selected_option = VALUES(selected_option),
      is_correct = VALUES(is_correct),
      submit_count = submit_count + 1,
      updated_at = CURRENT_TIMESTAMP`,
    [quizId, userId, quiz.lecture_id, userAnswer, selectedOption, 
     quiz.correct_option, quiz.correct_option, isCorrect ? 1 : 0, null, quiz.group_id]
  );
};

/**
 * 获取题目统计信息
 * @param {number} quizId - 题目ID
 */
const getQuizStats = async (quizId) => {
  const [rows] = await pool.promise().query(
    `SELECT * FROM quiz_answer_stats WHERE quiz_id = ?`,
    [quizId]
  );
  return rows[0] || {
    quiz_id: quizId,
    total_answers: 0,
    correct_answers: 0,
    accuracy_rate: 0,
    avg_answer_time_ms: null
  };
};

/**
 * 获取用户在某讲座的所有答题记录
 * @param {number} lectureId - 讲座ID
 * @param {number} userId - 用户ID
 */
const getUserAnswersByLecture = async (lectureId, userId) => {
  const [rows] = await pool.promise().query(
    `SELECT 
      qa.id,
      qa.quiz_id,
      qa.user_answer,
      qa.selected_option,
      qa.correct_answer,
      qa.correct_option,
      qa.is_correct,
      qa.answer_time_ms,
      qa.group_id,
      qa.answered_at,
      qa.submit_count,
      q.question,
      q.option_a,
      q.option_b,
      q.option_c,
      q.option_d
    FROM quiz_answers qa
    JOIN quizzes q ON qa.quiz_id = q.id
    WHERE qa.lecture_id = ? AND qa.user_id = ?
    ORDER BY qa.answered_at ASC`,
    [lectureId, userId]
  );
  return rows;
};

/**
 * 获取用户在某讲座的答题统计
 * @param {number} lectureId - 讲座ID 
 * @param {number} userId - 用户ID
 */
const getUserQuizStats = async (lectureId, userId) => {
  const [rows] = await pool.promise().query(
    `SELECT * FROM user_quiz_stats WHERE lecture_id = ? AND user_id = ?`,
    [lectureId, userId]
  );
  if (rows[0]) return rows[0];
  // 兜底：查找 quiz_answers 计算
  const [answers] = await pool.promise().query(
    `SELECT is_correct FROM quiz_answers WHERE lecture_id = ? AND user_id = ?`,
    [lectureId, userId]
  );
  const total = answers.length;
  const correct = answers.filter(a => a.is_correct).length;
  return {
    user_id: userId,
    lecture_id: lectureId,
    total_questions: total,
    correct_answers: correct,
    accuracy_rate: total > 0 ? Math.round((correct / total) * 1000) / 10 : 0, // 百分比，保留1位小数
    groups_participated: 0,
    avg_answer_time_ms: null
  };
};

/**
 * 获取讲座的整体答题统计
 * @param {number} lectureId - 讲座ID
 */
const getLectureQuizStats = async (lectureId) => {
  const [rows] = await pool.promise().query(
    `SELECT * FROM lecture_quiz_stats WHERE lecture_id = ?`,
    [lectureId]
  );
  return rows[0] || {
    lecture_id: lectureId,
    participants_count: 0,
    questions_count: 0,
    groups_count: 0,
    total_answers: 0,
    correct_answers: 0,
    overall_accuracy_rate: 0,
    avg_answer_time_ms: null
  };
};

/**
 * 获取题目组的答题统计
 * @param {number} lectureId - 讲座ID
 * @param {string} groupId - 题目组ID
 */
const getGroupQuizStats = async (lectureId, groupId) => {
  const [rows] = await pool.promise().query(
    `SELECT 
      group_id,
      lecture_id,
      COUNT(DISTINCT quiz_id) as questions_count,
      COUNT(DISTINCT user_id) as participants_count,
      COUNT(*) as total_answers,
      SUM(is_correct) as correct_answers,
      ROUND(SUM(is_correct) * 100.0 / COUNT(*), 2) as accuracy_rate,
      AVG(answer_time_ms) as avg_answer_time_ms
    FROM quiz_answers 
    WHERE lecture_id = ? AND group_id = ?
    GROUP BY group_id, lecture_id`,
    [lectureId, groupId]
  );
  return rows[0] || {
    group_id: groupId,
    lecture_id: lectureId,
    questions_count: 0,
    participants_count: 0,
    total_answers: 0,
    correct_answers: 0,
    accuracy_rate: 0,
    avg_answer_time_ms: null
  };
};

/**
 * 检查用户是否已回答某题目
 * @param {number} userId - 用户ID
 * @param {number} quizId - 题目ID
 */
const checkUserAnswered = async (userId, quizId) => {
  const [rows] = await pool.promise().query(
    `SELECT id, is_correct, answered_at FROM quiz_answers 
     WHERE user_id = ? AND quiz_id = ?`,
    [userId, quizId]
  );
  return rows[0] || null;
};

/**
 * 获取答题排行榜
 * @param {number} lectureId - 讲座ID
 * @param {number} limit - 返回数量限制
 */
const getAnswerLeaderboard = async (lectureId, limit = 10) => {
  // 确保 limit 是一个有效的数字
  const limitValue = parseInt(limit) || 10;
  
  const [rows] = await pool.promise().query(
    `SELECT 
      uqs.user_id,
      u.username,
      u.nickname,
      uqs.accuracy_rate,
      uqs.total_questions,
      uqs.correct_answers,
      uqs.avg_answer_time_ms
    FROM user_quiz_stats uqs
    JOIN users u ON uqs.user_id = u.id
    WHERE uqs.lecture_id = ?
    ORDER BY uqs.accuracy_rate DESC, uqs.total_questions DESC, uqs.avg_answer_time_ms ASC
    LIMIT ${limitValue}`,
    [lectureId]
  );
  return rows;
};

module.exports = {
  saveAnswer,
  saveAnswerNew,
  getQuizStats,
  getUserAnswersByLecture,
  getUserQuizStats,
  getLectureQuizStats,
  getGroupQuizStats,
  checkUserAnswered,
  getAnswerLeaderboard,
  pool // 导出 pool 供 controller 用
};
