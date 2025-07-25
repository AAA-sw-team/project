const { generateQuizFromText } = require('../utils/deepseek');
const fileReader = require('../utils/fileReader');
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
    const quizzes = await generateQuizFromText(allText);
    
    // 获取下一个组号（每个讲座从1开始）
    const group_id = await quizModel.getNextGroupId(lectureId);
    const quizIds = [];
    
    console.log(`AI生成的原始题目数据: ${quizzes.length}道题目，分配到第${group_id}组`);
    
    for (const q of quizzes) {
      // deepseek.js 已经处理并验证了正确答案，这里直接使用
      console.log('处理题目:', {
        question: q.question,
        correct_option: q.correct_option,
        options: [q.option_a, q.option_b, q.option_c, q.option_d]
      });
      
      const quizId = await quizModel.createQuiz({
        lectureId,
        question: q.question,
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        correctOption: q.correct_option, // 直接使用已验证的正确答案
        group_id: group_id.toString(), // 转换为字符串存储
        source_file_ids: sourceFileIds
      });
      quizIds.push(quizId);
    }
    res.status(200).json({ 
      message: 'Quiz 生成成功', 
      data: quizzes, 
      quizIds, 
      group_id: group_id.toString(),
      info: `成功生成 ${quizzes.length} 道题目，分配到第 ${group_id} 组`
    });
  } catch (error) {
    console.error('Quiz生成错误:', error);
    
    // 提供更详细的错误信息给前端
    let errorMessage = 'Quiz 生成失败';
    let errorDetail = error.message;
    
    if (error.message.includes('经过') && error.message.includes('次尝试')) {
      errorMessage = 'AI题目生成多次尝试后失败';
      errorDetail = '请检查讲座内容是否充足，或稍后重试';
    } else if (error.message.includes('正确答案无效')) {
      errorMessage = 'AI生成的题目格式有问题';
      errorDetail = '系统已自动重试，如仍失败请重新生成';
    } else if (error.message.includes('JSON')) {
      errorMessage = 'AI返回格式错误';
      errorDetail = '请重试，如问题持续存在请联系管理员';
    }
    
    res.status(500).json({ 
      error: errorMessage, 
      detail: errorDetail,
      timestamp: new Date().toISOString()
    });
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

// 获取某讲座的所有组号
const getGroupIds = async (req, res) => {
  const lectureId = req.params.lectureId;
  try {
    const groupIds = await quizModel.getGroupIds(lectureId);
    res.json({ 
      success: true, 
      data: groupIds,
      count: groupIds.length,
      message: `找到 ${groupIds.length} 个题目组`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get group IDs' });
  }
};

// 获取某讲座的已发布题目
const getPublishedQuizzes = async (req, res) => {
  const lectureId = req.params.lectureId;
  try {
    const quizzes = await quizModel.getPublishedQuizzes(lectureId);
    res.json({ 
      success: true, 
      data: { quizzes },
      count: quizzes.length,
      message: `找到 ${quizzes.length} 道已发布题目`
    });
  } catch (err) {
    console.error('获取已发布题目失败:', err);
    res.status(500).json({ 
      success: false,
      error: '获取已发布题目失败', 
      detail: err.message 
    });
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
    const quizzes = await generateQuizFromText(allText);
    
    // 获取下一个组号（每个讲座从1开始）
    const new_group_id = await quizModel.getNextGroupId(lectureId);
    const quizIds = [];
    
    console.log(`AI重新生成的原始题目数据: ${quizzes.length}道题目，分配到第${new_group_id}组`);
    
    for (const q of quizzes) {
      // deepseek.js 已经处理并验证了正确答案，这里直接使用
      console.log('重新生成处理题目:', {
        question: q.question,
        correct_option: q.correct_option,
        options: [q.option_a, q.option_b, q.option_c, q.option_d]
      });
      
      const quizId = await quizModel.createQuiz({
        lectureId,
        question: q.question,
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        correctOption: q.correct_option, // 直接使用已验证的正确答案
        group_id: new_group_id.toString(), // 转换为字符串存储
        source_file_ids: sourceFileIds
      });
      quizIds.push(quizId);
    }
    res.status(200).json({ 
      message: '题目重新生成成功', 
      data: quizzes, 
      quizIds, 
      group_id: new_group_id.toString(),
      info: `成功重新生成 ${quizzes.length} 道题目，分配到第 ${new_group_id} 组`
    });
  } catch (error) {
    console.error('题目重新生成错误:', error);
    
    // 提供更详细的错误信息给前端
    let errorMessage = '题目重新生成失败';
    let errorDetail = error.message;
    
    if (error.message.includes('经过') && error.message.includes('次尝试')) {
      errorMessage = 'AI题目重新生成多次尝试后失败';
      errorDetail = '请检查讲座内容是否充足，或稍后重试';
    } else if (error.message.includes('正确答案无效')) {
      errorMessage = 'AI重新生成的题目格式有问题';
      errorDetail = '系统已自动重试，如仍失败请重新生成';
    } else if (error.message.includes('JSON')) {
      errorMessage = 'AI返回格式错误';
      errorDetail = '请重试，如问题持续存在请联系管理员';
    }
    
    res.status(500).json({ 
      error: errorMessage, 
      detail: errorDetail,
      timestamp: new Date().toISOString()
    });
  }
};

// 删除单个题目
const deleteQuiz = async (req, res) => {
  const quizId = req.params.quizId;
  try {
    await quizModel.deleteQuiz(quizId);
    res.status(200).json({ message: '题目删除成功' });
  } catch (error) {
    res.status(500).json({ error: '题目删除失败', detail: error.message });
  }
};

module.exports = {
  generateQuiz,
  getQuizzes,
  getGroupIds,
  getPublishedQuizzes,
  publishQuizzes,
  RegenerateQuiz,
  deleteQuiz
};
