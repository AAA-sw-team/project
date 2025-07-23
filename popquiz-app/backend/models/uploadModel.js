const pool = require('./db');

// 插入文件记录
async function insertFile({ lectureId, speakerId, filename, filepath, filetype }) {
  const [result] = await pool.promise().query(
    'INSERT INTO files (lecture_id, speaker_id, filename, filepath, filetype) VALUES (?, ?, ?, ?, ?)',
    [lectureId, speakerId, filename, filepath, filetype]
  );
  return result.insertId;
}

// 追加文件ID到 lectures.file_ids
async function appendLectureFileId(lectureId, fileId) {
  const [lectureRows] = await pool.promise().query('SELECT file_ids FROM lectures WHERE id = ?', [lectureId]);
  let fileIds = [];
  if (lectureRows.length && lectureRows[0].file_ids) {
    try {
      fileIds = JSON.parse(lectureRows[0].file_ids);
    } catch (e) {
      fileIds = [];
    }
  }
  fileIds.push(fileId);
  await pool.promise().query('UPDATE lectures SET file_ids = ? WHERE id = ?', [JSON.stringify(fileIds), lectureId]);
}

module.exports = {
  insertFile,
  appendLectureFileId
};
