//上传文件控制器
const fs = require('fs');
const path = require('path');
const uploadModel = require('../models/uploadModel');

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

  const filename = file.filename; // 系统生成的文件名
  const originalName = file.originalname; // 用户上传的原始文件名
  const filepath = file.path;
  const filetype = file.mimetype;
  const fileSize = file.size;

  try {
    const fileId = await uploadModel.insertFile({
      lectureId,
      speakerId: req.user.userId,
      filename,
      originalName,
      filepath,
      filetype,
      fileSize
    });
    console.log('文件信息已保存到数据库，id:', fileId);
    try {
      await uploadModel.appendLectureFileId(lectureId, fileId);
      console.log(`[uploadController] 已将文件ID ${fileId} 追加到讲座 ${lectureId} 的 file_ids 字段`);
    } catch (e) {
      console.error('[uploadController] 更新 lectures.file_ids 失败:', e.message);
    }
    const fileInfo = {
      id: fileId,
      filename,
      original_name: originalName,
      filepath,
      filetype,
      size: fileSize,
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

// 讲座录制内容上传接口（音频/视频）
const uploadLectureMedia = async (req, res) => {
  const lectureId = req.params.id;
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: '未上传文件' });
  }
  const filename = file.originalname;
  const filepath = file.path;
  // 简单判断音频/视频类型
  let filetype = file.mimetype;
  if (filetype.startsWith('audio/')) filetype = 'audio';
  else if (filetype.startsWith('video/')) filetype = 'video';
  try {
    const fileId = await uploadModel.insertFile({
      lectureId,
      speakerId: req.user.userId,
      filename,
      filepath,
      filetype
    });
    res.status(200).json({
      message: '录制内容上传成功',
      file: {
        id: fileId,
        filename,
        filepath,
        filetype,
        uploaded_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: '录制内容上传失败', detail: error.message });
  }
};

module.exports = {
  handleUpload,
  uploadLectureMedia
}
