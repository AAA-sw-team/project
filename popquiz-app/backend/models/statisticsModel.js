const pool = require('./db');

// 获取某讲座所有题目总答题数和正确数
const getLectureOverallStats = async (lectureId) => {
  const [rows] = await pool.promise().query(
    `SELECT
      COUNT(DISTINCT a.user_id) AS total_users,
      COUNT(a.id) AS total_answers,
      SUM(a.is_correct) AS total_correct
    FROM quiz_answers a
    JOIN quizzes q ON a.quiz_id = q.id
    WHERE q.lecture_id = ?`,
    [lectureId]
  );
  return rows[0];
};

// 获取听众在该讲座的答题正确率及排名
const getUserRankings = async (lectureId) => {
  const [rows] = await pool.promise().query(
    `SELECT
       u.id AS user_id,
       u.username,
       SUM(a.is_correct) AS correct_count,
       COUNT(a.id) AS total_answered,
       ROUND(SUM(a.is_correct)/COUNT(a.id)*100,2) AS accuracy
     FROM users u
     JOIN quiz_answers a ON u.id = a.user_id
     JOIN quizzes q ON a.quiz_id = q.id
     WHERE q.lecture_id = ?
     GROUP BY u.id
     ORDER BY accuracy DESC, correct_count DESC`,
    [lectureId]
  );
  return rows;
};

module.exports = {
  getLectureOverallStats,
  getUserRankings
};
