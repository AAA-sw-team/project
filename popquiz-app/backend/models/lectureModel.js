const pool = require('./db');
// 创建讲座
const createLecture = (title, description, speakerId) => {
  return pool.promise().query(
    'INSERT INTO lectures (title, description, speaker_id) VALUES (?, ?, ?)',
    [title, description, speakerId]
  );
};
// 获取数据库中全部讲座
const getAllLectures = () => {
  return pool.promise().query('SELECT * FROM lectures ORDER BY created_at DESC');
};
// 获取当前用户的讲座
const getLecturesByUser = (userId) => {
  return pool.promise().query('SELECT * FROM lectures WHERE speaker_id = ?', [userId]);
};
// 删除讲座
const deleteLectureById = (lectureId, userId) => {
  return pool.promise().query('DELETE FROM lectures WHERE id = ? AND speaker_id = ?', [lectureId, userId]);
};

module.exports = {
  createLecture,
  getAllLectures,
  getLecturesByUser,
  deleteLectureById
};
