// 调用deepseek API 生成单项选择题
// 需要安装 axios 和 dotenv

const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:11434/api/generate';
//const API_KEY = process.env.DEEPSEEK_API_KEY;

async function generateQuizFromText(inputText) {
  const prompt = `
你是一个专业的 AI 出题助手以及一名优秀的命题老师，现在想要检查学生的听课情况，接下来我会给你一段讲座内容，请基于这段内容生成 5 道单项选择题（带四个选项和标准答案）。

重要要求：
1. 每题必须包含一个问题和4个完整的选项（A、B、C、D），只有一个正确答案。
2. 每个选项都必须有实际内容，不能为空。
3. 正确答案必须是 A、B、C、D 中的一个字母。
4. 问题应覆盖不同的知识点，避免重复。
5. 使用中文出题，内容清晰严谨，贴近讲座重点。
6. 返回格式必须是标准JSON数组，只输出JSON，不要输出任何解释或标签。
7. 请严格按照以下格式，确保每个字段都有有效内容：

[
  {
    "question": "具体的问题内容？",
    "option_a": "具体的选项A内容",
    "option_b": "具体的选项B内容", 
    "option_c": "具体的选项C内容",
    "option_d": "具体的选项D内容",
    "correct_option": "A"
  },
  {
    "question": "具体的问题内容？",
    "option_a": "具体的选项A内容",
    "option_b": "具体的选项B内容",
    "option_c": "具体的选项C内容", 
    "option_d": "具体的选项D内容",
    "correct_option": "B"
  }
]

注意：
- 每个选项必须是具体的内容，不能为空或只有占位符
- correct_option 必须准确对应某个选项
- 确保生成完整的5道题目

讲座内容如下：
${inputText}
`;

  try {
    const response = await axios.post(API_URL, {
      model: 'deepseek-r1:1.5b',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        stop: [
          "<｜begin▁of▁sentence｜>",
          "<｜end▁of▁sentence｜>",
          "<｜User｜>",
          "<｜Assistant｜>"
        ]
      }
    });

    const result = response.data.response;
    console.log('AI 原始返回内容:', result);
    
    // 提取第一个 [ 到最后一个 ] 之间的内容，防止带标签或多余内容
    const jsonMatch = result.match(/\[.*\]/s);
    if (!jsonMatch) throw new Error('AI 返回内容中未找到 JSON 数组');
    
    // 清理控制字符，但保留必要的空格和换行
    let cleanJson = jsonMatch[0]
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // 移除控制字符，但保留 \t \n \r
      .replace(/\t/g, ' ') // 将制表符替换为空格
      .replace(/\r\n/g, '\n') // 统一换行符
      .replace(/\r/g, '\n'); // 统一换行符
    
    console.log('清理后的JSON:', cleanJson);
    
    const parsed = JSON.parse(cleanJson);
    
    // 验证和修复生成的题目
    const validatedQuizzes = validateAndFixQuizzes(parsed);
    console.log('验证后的题目:', validatedQuizzes);
    
    return validatedQuizzes;
  } catch (error) {
    console.error('AI 调用失败:', error.message);
    
    if (error instanceof SyntaxError) {
      console.error('JSON 解析错误，详细信息:', {
        message: error.message,
        stack: error.stack
      });
      
      // 尝试进一步清理JSON字符串
      try {
        const response = await axios.post(API_URL, {
          model: 'deepseek-r1:1.5b',
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            stop: [
              "<｜begin▁of▁sentence｜>",
              "<｜end▁of▁sentence｜>",
              "<｜User｜>",
              "<｜Assistant｜>"
            ]
          }
        });
        
        const result = response.data.response;
        console.log('重试 - AI 原始返回内容:', result);
        
        // 更激进的清理策略
        let cleanedResult = result
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // 移除所有控制字符，但保留换行和制表符
          .replace(/\t/g, ' ') // 将制表符替换为空格
          .replace(/\r\n/g, '\n') // 统一换行符  
          .replace(/\r/g, '\n'); // 统一换行符
        
        // 重新查找JSON
        const jsonMatch = cleanedResult.match(/\[.*\]/s);
        if (!jsonMatch) {
          throw new Error('重试后仍未找到有效的JSON数组');
        }
        
        const parsed = JSON.parse(jsonMatch[0]);
        const validatedQuizzes = validateAndFixQuizzes(parsed);
        console.log('重试验证后的题目:', validatedQuizzes);
        return validatedQuizzes;
        
      } catch (retryError) {
        console.error('重试也失败了:', retryError.message);
        // 直接抛出错误，让用户知道具体问题
        throw new Error(`AI生成题目失败: ${retryError.message}`);
      }
    }
    
    // 直接抛出其他类型的错误
    throw new Error(`AI调用失败: ${error.message}`);
  }
}

// 验证和修复生成的题目
function validateAndFixQuizzes(quizzes) {
  if (!Array.isArray(quizzes)) {
    throw new Error('AI返回的数据格式错误，不是有效的题目数组');
  }
  
  if (quizzes.length === 0) {
    throw new Error('AI没有生成任何题目，请重试');
  }
  
  return quizzes.map((quiz, index) => {
    // 验证问题
    if (!quiz.question || typeof quiz.question !== 'string' || quiz.question.trim() === '') {
      throw new Error(`第${index + 1}题的问题内容为空或无效`);
    }
    
    // 验证所有选项
    const options = ['option_a', 'option_b', 'option_c', 'option_d'];
    const optionLabels = ['A', 'B', 'C', 'D'];
    
    options.forEach((optionKey, optionIndex) => {
      if (!quiz[optionKey] || typeof quiz[optionKey] !== 'string' || quiz[optionKey].trim() === '') {
        throw new Error(`第${index + 1}题的选项${optionLabels[optionIndex]}为空或无效`);
      }
    });
    
    // 验证并提取正确答案
    const correctOption = extractCorrectOption(quiz.correct_option);
    if (!correctOption) {
      throw new Error(`第${index + 1}题的正确答案无效或无法识别: "${quiz.correct_option}"`);
    }
    quiz.correct_option = correctOption;
    
    return quiz;
  }).slice(0, 5); // 确保只返回5道题
}

// 提取正确选项字母
function extractCorrectOption(correctOption) {
  if (!correctOption) return null;
  
  const option = correctOption.toString().trim();
  console.log('提取正确答案:', option);
  
  // 1. 直接匹配单个字母 A, B, C, D (不区分大小写)
  const directMatch = option.match(/^[ABCD]$/i);
  if (directMatch) {
    return directMatch[0].toUpperCase();
  }
  
  // 2. 匹配包含字母的格式，如 "选项A", "答案B", "A选项", "(A)", "A.", "A："等
  const letterMatch = option.match(/[ABCD]/i);
  if (letterMatch) {
    return letterMatch[0].toUpperCase();
  }
  
  // 3. 匹配中文数字或阿拉伯数字转换为字母
  const numberMapping = {
    '1': 'A', '一': 'A', '第一': 'A',
    '2': 'B', '二': 'B', '第二': 'B', 
    '3': 'C', '三': 'C', '第三': 'C',
    '4': 'D', '四': 'D', '第四': 'D'
  };
  
  for (const [key, value] of Object.entries(numberMapping)) {
    if (option.includes(key)) {
      console.log(`将 "${key}" 转换为 "${value}"`);
      return value;
    }
  }
  
  // 4. 尝试从选项内容中匹配
  // 如果答案是选项的内容，可以进一步扩展匹配逻辑
  
  console.warn('无法识别的正确答案格式:', option);
  return null;
}

module.exports = {
  generateQuizFromText
};
