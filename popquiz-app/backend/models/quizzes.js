const pool = require('./db');

const createQuiz = (lectureId, quizList) => {
  const values = quizList.map(q => [
    lectureId, q.question, q.a, q.b, q.c, q.d, q.answer
  ]);
  return pool.promise().query(
    `INSERT INTO quizzes (lecture_id, question, option_a, option_b, option_c, option_d, correct_option) VALUES ?`,
    [values]
  );
};

const getQuizzesByLecture = (lectureId) => {
  return pool.promise().query(
    'SELECT * FROM quizzes WHERE lecture_id = ?', [lectureId]
  );
};

module.exports = { createQuiz, getQuizzesByLecture };
