const { generateQuizFromText } = require('../utils/deepseek');
const fileReader = require('../utils/fileReader');
const { v4: uuidv4 } = require('uuid');
const quizModel = require('../models/quizzes');
const fileModel = require('../models/fileModel');

// 生成题目（支持多文件/录音/count/group_id）
const generateQuiz = async (req, res) => {
  const lectureId = req.params.id;
  const { file_ids = [], media_id = '', count = 5 } = req.body;
  if ((!Array.isArray(file_ids) || file_ids.length === 0) && !media_id) {
    return res.status(400).json({ error: 'file_ids 和 media_id 至少提供一个' });
  }
  try {
    // 获取所有文件内容
    let allText = '';
    let sourceFileIds = [];
    if (Array.isArray(file_ids) && file_ids.length > 0) {
      const files = await fileModel.getFilesByIds(file_ids);
      for (const file of files) {
        const text = await fileReader.extractTextFromFile(file.filepath);
        if (text) {
          allText += text + '\n';
          sourceFileIds.push(file.id);
        }
      }
    }
    if (media_id) {
      const mediaFile = await fileModel.getFileById(media_id);
      if (mediaFile) {
        const mediaText = await fileReader.extractTextFromFile(mediaFile.filepath);
        if (mediaText) {
          allText += mediaText + '\n';
          sourceFileIds.push(mediaFile.id);
        }
      }
    }
    if (!allText) {
      return res.status(400).json({ error: '所选文件和录音内容均为空或解析失败' });
    }
    const quizzes = await generateQuizFromText(allText, count);
    const group_id = uuidv4();
    const quizIds = [];
    for (const q of quizzes) {
      const correctOption = (q.correct_option || '').trim().charAt(0).toUpperCase();
      const quizId = await quizModel.createQuiz({
        lectureId,
        question: q.question,
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        correctOption,
        group_id,
        source_file_ids: sourceFileIds
      });
      quizIds.push(quizId);
    }
    res.status(200).json({ message: 'Quiz 生成成功', data: quizzes, quizIds, group_id });
  } catch (error) {
    res.status(500).json({ error: 'Quiz 生成失败', detail: error.message });
  }
};

// 发布题目（按讲座和 quiz_ids）
const publishQuizzes = async (req, res) => {
  const lectureId = req.params.id;
  const { quiz_ids } = req.body;
  if (!Array.isArray(quiz_ids) || quiz_ids.length === 0) {
    return res.status(400).json({ error: 'quiz_ids 不能为空' });
  }
  try {
    await quizModel.publishLectureQuizzes(lectureId, quiz_ids);
    res.status(200).json({ message: '题目已全部发布' });
  } catch (error) {
    res.status(500).json({ error: '题目发布失败', detail: error.message });
  }
};

// 获取某讲座的所有 quiz
const getQuizzes = async (req, res) => {
  const lectureId = req.params.lectureId;
  try {
    const rows = await quizModel.getQuizzes(lectureId);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get quizzes' });
  }
};


// 重新生成题目（先删除 group_id 下题目，再生成新题）
const RegenerateQuiz = async (req, res) => {
  const lectureId = req.params.id;
  const { group_id, file_ids = [], media_id = '', count = 5 } = req.body;
  if (!group_id) {
    return res.status(400).json({ error: 'group_id 不能为空' });
  }
  try {
    // 1. 删除原有 group 下题目
    await quizModel.deleteQuizzes(lectureId, group_id);
    // 2. 生成新题
    // 获取所有文件内容
    let allText = '';
    let sourceFileIds = [];
    if (Array.isArray(file_ids) && file_ids.length > 0) {
      const files = await fileModel.getFilesByIds(file_ids);
      for (const file of files) {
        const text = await fileReader.extractTextFromFile(file.filepath);
        if (text) {
          allText += text + '\n';
          sourceFileIds.push(file.id);
        }
      }
    }
    if (media_id) {
      const mediaFile = await fileModel.getFileById(media_id);
      if (mediaFile) {
        const mediaText = await fileReader.extractTextFromFile(mediaFile.filepath);
        if (mediaText) {
          allText += mediaText + '\n';
          sourceFileIds.push(mediaFile.id);
        }
      }
    }
    if (!allText) {
      return res.status(400).json({ error: '所选文件和录音内容均为空或解析失败' });
    }
    const quizzes = await generateQuizFromText(allText, count);
    const new_group_id = uuidv4();
    const quizIds = [];
    for (const q of quizzes) {
      const correctOption = (q.correct_option || '').trim().charAt(0).toUpperCase();
      const quizId = await quizModel.createQuiz({
        lectureId,
        question: q.question,
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        correctOption,
        group_id: new_group_id,
        source_file_ids: sourceFileIds
      });
      quizIds.push(quizId);
    }
    res.status(200).json({ message: '题目重新生成成功', data: quizzes, quizIds, group_id: new_group_id });
  } catch (error) {
    res.status(500).json({ error: '题目重新生成失败', detail: error.message });
  }
};

module.exports = {
  generateQuiz,
  getQuizzes,
  publishQuizzes,
  RegenerateQuiz
};
