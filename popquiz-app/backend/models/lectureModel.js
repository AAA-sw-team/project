const pool = require('./db');
// 创建讲座
/**
 * 新建讲座
 */
async function createLecture_db(title, description, speakerId, name) {
  const sql = 'INSERT INTO lectures (title, description, speaker_id, name, created_at) VALUES (?, ?, ?, ?, NOW())';
  return pool.promise().query(sql, [title, description, speakerId, name]);
}
// 获取数据库中全部讲座
/**
 * 获取所有讲座
 */
async function getAllLectures_db() {
  const sql = 'SELECT id, title, description, name, created_at FROM lectures ORDER BY created_at DESC';
  return pool.promise().query(sql);
}
// 获取当前用户的讲座，按创建时间倒序
/**
 * 获取某用户的讲座
 */
async function getLecturesByUser_db(userId) {
  const sql = 'SELECT id, title, description, name, created_at FROM lectures WHERE speaker_id = ? ORDER BY created_at DESC';
  return pool.promise().query(sql, [userId]);
}
// 删除讲座
/**
 * 删除讲座（只允许讲者本人删除）
 */
async function deleteLectureById(lectureId, userId) {
  const sql = 'DELETE FROM lectures WHERE id = ? AND speaker_id = ?';
  return pool.promise().query(sql, [lectureId, userId]);
}
/**
 * 获取讲座详情
 */
async function getLectureById(lectureId) {
  const sql = 'SELECT * FROM lectures WHERE id = ?';
  return pool.promise().query(sql, [lectureId]);
}

/**
 * 更新讲座状态（如结束讲座）
 */
async function updateLectureStatus(lectureId, status) {
  const sql = 'UPDATE lectures SET status = ? WHERE id = ?';
  return pool.promise().query(sql, [status, lectureId]);
}

module.exports = {
  createLecture_db,
  getAllLectures_db,
  getLecturesByUser_db,
  deleteLectureById,
  getLectureById,
  updateLectureStatus
};
