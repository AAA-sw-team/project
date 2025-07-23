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
      // 兼容 file_ids 可能为 JSON 数组、逗号分隔字符串或单个数字
      let raw = lectureRows[0].file_ids;
      if (Array.isArray(raw)) {
        fileIds = raw;
      } else if (typeof raw === 'string') {
        // 先尝试 JSON.parse
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            fileIds = parsed;
          } else if (typeof parsed === 'string') {
            fileIds = parsed.split(',').filter(Boolean);
          } else {
            fileIds = [];
          }
        } catch (e) {
          fileIds = raw.split(',').filter(Boolean);
        }
      } else if (typeof raw === 'number') {
        fileIds = [String(raw)];
      }
    } catch (e) {
      fileIds = [];
    }
  }
  fileIds.push(String(fileId));
  await pool.promise().query('UPDATE lectures SET file_ids = ? WHERE id = ?', [JSON.stringify(fileIds), lectureId]);
}

module.exports = {
  insertFile,
  appendLectureFileId
};
