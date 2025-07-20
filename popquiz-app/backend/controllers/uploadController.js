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

    res.status(200).json({
      message: '文件上传成功',
      file: {
        id: result.insertId,
        lecture_id: lectureId,
        filename,
        filepath,
        filetype
      }
    });
  } catch (error) {
    console.error('文件上传数据库保存失败:', error.message);
    res.status(500).json({ error: '上传失败', detail: error.message });
  }
};

module.exports = {
  handleUpload
}
