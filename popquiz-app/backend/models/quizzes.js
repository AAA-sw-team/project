const pool = require('./db');

// 插入 quiz
const createQuiz = (lectureId, question, options, correctOption) => {
  const [a, b, c, d] = options;
  return pool.promise().query(
    'INSERT INTO quizzes (lecture_id, question, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [lectureId, question, a, b, c, d, correctOption]
  );
};

// 获取某讲座的所有 quiz
const getQuizzesByLectureId = (lectureId) => {
  return pool.promise().query(
    'SELECT * FROM quizzes WHERE lecture_id = ? ORDER BY created_at DESC',
    [lectureId]
  );
};

module.exports = {
  createQuiz,
  getQuizzesByLectureId
};
