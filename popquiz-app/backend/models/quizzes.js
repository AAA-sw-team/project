const pool = require('./db');

// 删除 quiz
const deleteQuiz = (quizId) => {
  return pool.promise().query('DELETE FROM quizzes WHERE id = ?', [quizId]);
};

// 获取某文件所有已发布的 quiz
const getPublishedQuizzesByFileId = (fileId) => {
  return pool.promise().query(
    'SELECT * FROM quizzes WHERE file_id = ? AND published = 1 ORDER BY created_at DESC',
    [fileId]
  );
};

// 获取某文件的所有 quiz
const getQuizzesByFileId = (fileId) => {
  return pool.promise().query(
    'SELECT * FROM quizzes WHERE file_id = ? ORDER BY created_at DESC',
    [fileId]
  );
};

// 获取所有已发布的 quiz
const getAllPublishedQuizzes = () => {
  return pool.promise().query(
    'SELECT * FROM quizzes WHERE published = 1 ORDER BY created_at DESC'
  );
};

// 获取某讲座所有已发布的 quiz
const getPublishedQuizzesByLectureId = (lectureId) => {
  return pool.promise().query(
    'SELECT * FROM quizzes WHERE lecture_id = ? AND published = 1 ORDER BY created_at DESC',
    [lectureId]
  );
};

// 设置 quiz 发布状态
const setQuizPublished = (quizId, published) => {
  return pool.promise().query(
    'UPDATE quizzes SET published = ? WHERE id = ?',
    [published, quizId]
  );
};

// 获取单个 quiz
const getQuizById = (quizId) => {
  return pool.promise().query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
};

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
  getQuizzesByLectureId,
  setQuizPublished,
  getQuizById,
  getQuizzesByFileId,
  getAllPublishedQuizzes,
  getPublishedQuizzesByLectureId,
  getPublishedQuizzesByFileId,
  deleteQuiz,
};
