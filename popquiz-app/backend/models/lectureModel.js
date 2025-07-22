const pool = require('./db');

const createLecture = (title, description, speakerId) => {
  return pool.promise().query(
    'INSERT INTO lectures (title, description, speaker_id) VALUES (?, ?, ?)',
    [title, description, speakerId]
  );
};

const getAllLectures = () => {
  return pool.promise().query('SELECT * FROM lectures ORDER BY created_at DESC');
};

const getLecturesByUser = (userId) => {
  return pool.promise().query('SELECT * FROM lectures WHERE speaker_id = ?', [userId]);
};

const deleteLectureById = (lectureId, userId) => {
  return pool.promise().query('DELETE FROM lectures WHERE id = ? AND speaker_id = ?', [lectureId, userId]);
};

module.exports = {
  createLecture,
  getAllLectures,
  getLecturesByUser,
  deleteLectureById
};
