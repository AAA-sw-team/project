const path = require('path');
const fs = require('fs');
const pool = require('../models/db');
const fileModel = require('../models/fileModel');

// 获取讲座已上传文件列表
const getLectureFiles = async (req, res) => {
  const lectureId = req.params.id;
  try {
    const files = await fileModel.getFilesByLectureId(lectureId);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: '获取讲座文件失败' });
  }
};

//获取数据库所有文件
const getAllFiles = async (req, res) => {
  try {
    const files = await fileModel.getAllFiles_db();
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: '获取文件列表失败' });
  }
};

//获取用户所有文件
const getUserFiles = async (req, res) => {
  const speakerId = req.user.id || req.user.userId;
  try {
    const files = await fileModel.getFilesByUserId(speakerId);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: '获取用户文件失败' });
  }
};
module.exports = {
  getLectureFiles,
  getAllFiles,
  getUserFiles
};
