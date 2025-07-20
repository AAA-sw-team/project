
const pool = require('./db');

// 获取所有文件
async function getAllFiles() {
  const [rows] = await pool.query('SELECT * FROM files ORDER BY created_at DESC');
  return rows;
}

// 获取某用户的所有文件
async function getFilesByUserId(userId) {
  const [rows] = await pool.query('SELECT * FROM files WHERE speaker_id = ? ORDER BY created_at DESC', [userId]);
  return rows;
}

// 获取某讲座的所有文件
async function getFilesByLectureId(lectureId) {
  const [rows] = await pool.query('SELECT * FROM files WHERE lecture_id = ? ORDER BY created_at DESC', [lectureId]);
  return rows;
}

module.exports = {
  getAllFiles,
  getFilesByUserId,
  getFilesByLectureId
};
