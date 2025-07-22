//上传文件控制器
const fs = require('fs');
const path = require('path');
const pool = require('../models/db');

const handleUpload = async (req, res) => {
  const lectureId = req.params.lectureId;
  const file = req.file;
  console.log('[uploadController] 收到上传请求，lectureId:', lectureId);
  console.log('[uploadController] req.file:', file);
  console.log('[uploadController] req.headers:', req.headers);
  console.log('[uploadController] req.user:', req.user);

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filename = file.originalname;
  const filepath = file.path;
  const filetype = file.mimetype;

  try {
    const [result] = await pool.promise().query(
      'INSERT INTO files (lecture_id, speaker_id, filename, filepath, filetype) VALUES (?, ?, ?, ?, ?)',
      [lectureId, req.user.userId, filename, filepath, filetype]
    );

    console.log('文件信息已保存到数据库，id:', result.insertId);

    // 追加文件ID到 lectures 表 file_ids 字段
    try {
      const [lectureRows] = await pool.promise().query('SELECT file_ids FROM lectures WHERE id = ?', [lectureId]);
      let fileIds = [];
      if (lectureRows.length && lectureRows[0].file_ids) {
        try {
          fileIds = JSON.parse(lectureRows[0].file_ids);
        } catch (e) {
          console.warn('[uploadController] file_ids 字段解析失败，将覆盖为新数组');
        }
      }
      fileIds.push(result.insertId);
      await pool.promise().query('UPDATE lectures SET file_ids = ? WHERE id = ?', [JSON.stringify(fileIds), lectureId]);
      console.log(`[uploadController] 已将文件ID ${result.insertId} 追加到讲座 ${lectureId} 的 file_ids 字段`);
    } catch (e) {
      console.error('[uploadController] 更新 lectures.file_ids 失败:', e.message);
    }

    // 只返回部分字段
    const fileInfo = {
      id: result.insertId,
      filename,
      filepath,
      filetype,
      uploaded_at: new Date().toISOString()
    };
    res.status(200).json({
      message: '文件上传成功',
      file: fileInfo
    });
  } catch (error) {
    console.error('文件上传数据库保存失败:', error.message);
    res.status(500).json({ error: '上传失败', detail: error.message });
  }
};

module.exports = {
  handleUpload
}
