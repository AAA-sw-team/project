const quizModel = require('../models/quizzes');
const fs = require('fs');
const path = require('path');
const { generateQuizFromText } = require('../utils/deepseek');
const Quiz = require('../models/quizzes');
const pool = require('../models/db');
const fileModel = require('../models/fileModel');
const fileReader = require('../utils/fileReader');

// 根据前端选择的文件生成题目
const generateQuiz = async (req, res) => {
  const { fileId } = req.body;
  try {
    // 查找文件路径及 lecture_id
    const [files] = await pool.promise().query('SELECT * FROM files WHERE id = ?', [fileId]);
    if (!files.length) {
      return res.status(404).json({ error: '未找到对应文件' });
    }
    const file = files[0];
    const lectureId = file.lecture_id;
    // 解析文件内容
    const text = await fileReader.extractTextFromFile(file.filepath);
    if (!text) {
      return res.status(400).json({ error: '文件内容为空或解析失败' });
    }
    // 生成题目
    const quizzes = await generateQuizFromText(text);
    for (const q of quizzes) {
      // 只取首字母大写，防止 correct_option 超长
      const correctOption = (q.correct_option || '').trim().charAt(0).toUpperCase();
      await quizModel.createQuiz(
        lectureId,
        q.question,
        [q.option_a, q.option_b, q.option_c, q.option_d],
        correctOption
      );
    }
    res.status(200).json({ message: 'Quiz 生成成功', data: quizzes });
  } catch (error) {
    res.status(500).json({ error: 'Quiz 生成失败', detail: error.message });
  }
};

//获取某讲座的所有quiz
const getQuizzes = async (req, res) => {
  const lectureId = req.params.lectureId;

  try {
    const [rows] = await quizModel.getQuizzesByLectureId(lectureId);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get quizzes' });
  }
};

module.exports = {
  generateQuiz,
  getQuizzes,
};
