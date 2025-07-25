const pool = require('./db');

// 插入 quiz
async function createQuiz({ lectureId, question, options, correctOption, group_id, source_file_ids }) {
  const [a, b, c, d] = options;
  const [result] = await pool.promise().query(
    'INSERT INTO quizzes (lecture_id, question, option_a, option_b, option_c, option_d, correct_option, group_id, source_file_ids) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [lectureId, question, a, b, c, d, correctOption, group_id, JSON.stringify(source_file_ids)]
  );
  return result.insertId;
}

//删除单个quiz 
function deleteQuiz(quizId) {
  return pool.promise().query('DELETE FROM quizzes WHERE id = ?', [quizId]);
}

// 删除某讲座下指定 group_id 的所有题目 
async function deleteQuizzes(lectureId, group_id) {
  await pool.promise().query(
    'DELETE FROM quizzes WHERE lecture_id = ? AND group_id = ?',
    [lectureId, group_id]
  );
}


//获取单个 quiz 
function getQuizById(quizId) {
  return pool.promise().query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
}


//获取某讲座所有 quiz
async function getQuizzes(lectureId) {
  const [rows] = await pool.promise().query(
    'SELECT id, question, option_a, option_b, option_c, option_d, correct_option, published, group_id, source_file_ids, created_at FROM quizzes WHERE lecture_id = ? ORDER BY created_at DESC',
    [lectureId]
  );
  return rows;
}

//获取某讲座下指定分组的所有题目 
async function getQuizzesByGroupId(lectureId, group_id) {
  const [rows] = await pool.promise().query(
    'SELECT * FROM quizzes WHERE lecture_id = ? AND group_id = ? ORDER BY created_at DESC',
    [lectureId, group_id]
  );
  return rows;
}

/** 批量发布题目 */
async function publishQuizzes(quizIds) {
  if (!Array.isArray(quizIds) || quizIds.length === 0) return;
  const placeholders = quizIds.map(() => '?').join(',');
  await pool.promise().query(
    `UPDATE quizzes SET published = 1 WHERE id IN (${placeholders})`,
    quizIds
  );
}

/** 批量发布某讲座的题目 */
async function publishLectureQuizzes(lectureId, quizIds) {
  if (!Array.isArray(quizIds) || quizIds.length === 0) return;
  const placeholders = quizIds.map(() => '?').join(',');
  await pool.promise().query(
    `UPDATE quizzes SET published = 1 WHERE lecture_id = ? AND id IN (${placeholders})`,
    [lectureId, ...quizIds]
  );
}

/** 获取某讲座的下一个组号（从1开始） */
async function getNextGroupId(lectureId) {
  const [rows] = await pool.promise().query(
    'SELECT COALESCE(MAX(CAST(group_id AS UNSIGNED)), 0) + 1 as next_group_id FROM quizzes WHERE lecture_id = ? AND group_id REGEXP "^[0-9]+$"',
    [lectureId]
  );
  return rows[0].next_group_id;
}

/** 获取某讲座所有的组号列表 */
async function getGroupIds(lectureId) {
  const [rows] = await pool.promise().query(
    'SELECT DISTINCT group_id FROM quizzes WHERE lecture_id = ? ORDER BY CAST(group_id AS UNSIGNED)',
    [lectureId]
  );
  return rows.map(row => row.group_id);
}

/** 获取某讲座的已发布题目 */
async function getPublishedQuizzes(lectureId) {
  const [rows] = await pool.promise().query(
    'SELECT * FROM quizzes WHERE lecture_id = ? AND published = 1 ORDER BY CAST(group_id AS UNSIGNED), created_at',
    [lectureId]
  );
  return rows;
}

module.exports = {
  createQuiz,
  deleteQuiz,
  getQuizById,
  getQuizzes,
  publishQuizzes,
  publishLectureQuizzes,
  deleteQuizzes,
  getQuizzesByGroupId,
  getNextGroupId,
  getGroupIds,
  getPublishedQuizzes
};
