const pool = require('../db');

const saveAnswer = (quizId, userId, selectedOption, isCorrect) => {
  return pool.promise().query(
    'INSERT INTO answers (quiz_id, user_id, selected_option, is_correct) VALUES (?, ?, ?, ?)',
    [quizId, userId, selectedOption, isCorrect ? 1 : 0]
  );
};

const getQuizStats = async (quizId) => {
  const [rows] = await pool.promise().query(
    `SELECT
       COUNT(*) AS total_answers,
       SUM(is_correct) AS correct_answers
     FROM answers WHERE quiz_id = ?`,
    [quizId]
  );
  return rows[0];
};

const getUserAnswersByLecture = (lectureId, userId) => {
  return pool.promise().query(
    `SELECT a.*, q.question FROM answers a
     JOIN quizzes q ON a.quiz_id = q.id
     WHERE q.lecture_id = ? AND a.user_id = ?`,
    [lectureId, userId]
  );
};

module.exports = {
  saveAnswer,
  getQuizStats,
  getUserAnswersByLecture
};
