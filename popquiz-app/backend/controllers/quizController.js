const quizModel = require('../models/quizModel');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');  // 用于PDF文本解析


// 模拟 AI 生成选择题
const generateQuizFromText = async (lectureId, text) => {
  // 这里简单模拟，真实可以调用外部AI接口
  const fakeQuizzes = [
    {
      question: 'AI 是什么的缩写？',
      options: ['Artificial Intelligence', 'Animal Intelligence', 'Auto Interface', 'Advanced Input'],
      correctOption: 'A',
    },
    {
      question: '机器学习属于哪种技术？',
      options: ['硬件技术', '软件技术', '人工智能', '网络技术'],
      correctOption: 'C',
    }
  ];

  for (const quiz of fakeQuizzes) {
    await quizModel.createQuiz(
      lectureId,
      quiz.question,
      quiz.options,
      quiz.correctOption
    );
  }

  return fakeQuizzes;
};

//上传文件
const handleUpload = async (req, res) => {
  const lectureId = req.params.lectureId;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const ext = path.extname(file.originalname).toLowerCase();

  try {
    let textContent = '';

    if (ext === '.txt') {
      textContent = fs.readFileSync(file.path, 'utf8');
    } else if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(file.path);
      const data = await pdfParse(dataBuffer);
      textContent = data.text;
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // 调用生成题目函数
    const quizzes = await generateQuizFromText(lectureId, textContent);

    res.json({
      message: 'File uploaded, text extracted, quizzes generated',
      lectureId,
      filePath: file.path,
      quizzes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process file and generate quizzes' });
  }
};

// 创建 quiz（暂用模拟数据）
const generateQuiz = async (req, res) => {
  const lectureId = req.params.lectureId;

  // TODO: 后期用 AI 生成
  const sampleQuiz = {
    question: 'AI 是什么的缩写？',
    options: ['Artificial Intelligence', 'Animal Intelligence', 'Auto Interface', 'Advanced Input'],
    correctOption: 'A'
  };

  try {
    await quizModel.createQuiz(
      lectureId,
      sampleQuiz.question,
      sampleQuiz.options,
      sampleQuiz.correctOption
    );
    res.json({ message: 'Quiz created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create quiz' });
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
  handleUpload
};
