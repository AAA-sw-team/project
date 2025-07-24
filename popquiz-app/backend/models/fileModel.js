const pool = require('./db');

/** 批量获取文件信息 */
async function getFilesByIds(fileIds) {
  if (!Array.isArray(fileIds) || fileIds.length === 0) return [];
  const [rows] = await pool.promise().query(
    `SELECT * FROM files WHERE id IN (${fileIds.map(() => '?').join(',')})`,
    fileIds
  );
  return rows;
}

/** 获取单个文件信息 */
async function getFileById(fileId) {
  const [rows] = await pool.promise().query('SELECT * FROM files WHERE id = ?', [fileId]);
  return rows[0] || null;
}



// 获取所有文件
async function getAllFiles_db() {
  const [rows] = await pool.promise().query('SELECT * FROM files ORDER BY created_at DESC');
  return rows;
}

// 获取某用户的所有文件
async function getFilesByUserId(userId) {
  const [rows] = await pool.promise().query('SELECT * FROM files WHERE speaker_id = ? ORDER BY created_at DESC', [userId]);
  return rows;
}


// 获取某讲座的所有文件
async function getFilesByLectureId(lectureId) {
  const [rows] = await pool.promise().query(
    'SELECT id, filename, filename as original_name, uploaded_at, uploaded_at as created_at FROM files WHERE lecture_id = ? ORDER BY uploaded_at DESC', 
    [lectureId]
  );
  return rows;
}

module.exports = {
  getAllFiles_db,
  getFilesByUserId,
  getFilesByLectureId,
  getFilesByIds,
  getFileById
};
