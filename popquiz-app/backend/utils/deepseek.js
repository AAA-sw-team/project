// 调用deepseek API 生成单项选择题
// 需要安装 axios 和 dotenv

const axios = require('axios');
require('dotenv').config();

const API_URL = 'https://api.deepseek.com/v1/chat/completions';
const API_KEY = process.env.DEEPSEEK_API_KEY;

async function generateQuizFromText(inputText, retryCount = 0) {
  const maxRetries = 3; // 最大重试次数
  
  const prompt = `
请直接输出JSON数组，不要包含任何思考过程、解释、推理或其他文本。

你是一个专业的 AI 出题助手以及一名优秀的命题老师，现在想要检查学生的听课情况，请阅读以下文本内容，并基于其核心观点或隐含含义，生成 5 道单项选择题（带四个选项和标准答案），我希望你能够给出一些值得思考和深思的题目，具有一定意义，可以引用实事新闻传记书藉等中的语句作为材料，题干尽量能给的长一些。

重要要求：
1. 不用进行分析，输出的直接为题目，每题必须包含一个问题和4个完整的选项（A、B、C、D），只有一个正确答案。
2. 每个选项都必须有实际内容，字数不能为空，至少有两个题题目问题部分不少于60字。
3. 正确答案必须严格是 A、B、C、D 中的一个字母，绝对不能使用 E、F 或其他字母。
4. 问题应覆盖不同的知识点，问题形式避免重复,问题内容应基于文本，但不局限于表层内容，可适度延伸，具有思辨性或延伸性，能够引发读者深入思考
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

特别注意：
- 每个选项必须是具体的内容，不能为空或只有占位符
- correct_option 必须严格是 A、B、C、D 中的一个，不能是 E、F 等其他字母
- 确保生成完整的5道题目
- 每个 correct_option 必须对应实际存在的选项

讲座内容如下：
${inputText}
`;

  try {
    console.log(`正在生成题目... (尝试 ${retryCount + 1}/${maxRetries + 1})`);
    
    const response = await axios.post(API_URL, {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: false,
      temperature: 0.6 + (retryCount * 0.1), // 每次重试稍微调整温度
      max_tokens: 4000
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const result = response.data.choices[0].message.content;
    console.log('AI 原始返回内容:', result);
    
    // 处理 DeepSeek R1 模型的 <think> 标签，提取实际响应内容
    let cleanedResult = result;
    
    // 如果包含 <think> 标签，提取 </think> 后的内容
    const thinkTagEnd = result.indexOf('</think>');
    if (thinkTagEnd !== -1) {
      cleanedResult = result.substring(thinkTagEnd + 8).trim(); // 8 是 '</think>' 的长度
      console.log('移除 <think> 标签后的内容:', cleanedResult);
    }
    
    // 提取第一个 [ 到最后一个 ] 之间的内容，防止带标签或多余内容
    const jsonMatch = cleanedResult.match(/\[.*\]/s);
    if (!jsonMatch) {
      console.log('在清理后的内容中未找到 JSON 数组，尝试从原始内容中提取...');
      const fallbackMatch = result.match(/\[.*\]/s);
      if (!fallbackMatch) throw new Error('AI 返回内容中未找到 JSON 数组');
      var matchedContent = fallbackMatch[0];
    } else {
      var matchedContent = jsonMatch[0];
    }
    
    // 清理控制字符，但保留必要的空格和换行
    let cleanJson = matchedContent
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
    console.error(`AI 调用失败 (尝试 ${retryCount + 1}):`, error.message);
    
    // 如果是验证错误且还可以重试，则重新生成
    if (retryCount < maxRetries && (
      error.message.includes('正确答案无效') || 
      error.message.includes('无法识别') ||
      error.message.includes('选项') ||
      error.message.includes('问题内容')
    )) {
      console.log(`检测到题目质量问题，正在重新生成... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
      return generateQuizFromText(inputText, retryCount + 1);
    }
    
    if (error instanceof SyntaxError) {
      console.error('JSON 解析错误，详细信息:', {
        message: error.message,
        stack: error.stack
      });
      
      // 如果还可以重试，则重新生成
      if (retryCount < maxRetries) {
        console.log(`JSON解析失败，正在重新生成... (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return generateQuizFromText(inputText, retryCount + 1);
      }
    }
    
    // 如果达到最大重试次数，提供更详细的错误信息
    if (retryCount >= maxRetries) {
      throw new Error(`经过 ${maxRetries + 1} 次尝试后仍然失败: ${error.message}`);
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
    
    // 验证并修复正确答案
    let correctOption = extractAndFixCorrectOption(quiz, index + 1);
    if (!correctOption) {
      throw new Error(`第${index + 1}题的正确答案无效或无法识别: "${quiz.correct_option}"，需要重新生成`);
    }
    quiz.correct_option = correctOption;
    
    return quiz;
  }).slice(0, 5); // 确保只返回5道题
}

// 提取并修复正确选项字母
function extractAndFixCorrectOption(quiz, questionNumber) {
  const correctOption = quiz.correct_option;
  if (!correctOption) {
    console.warn(`第${questionNumber}题缺少正确答案`);
    return null;
  }
  
  const option = correctOption.toString().trim();
  console.log(`第${questionNumber}题 - 提取正确答案:`, option);
  
  // 1. 直接匹配单个字母 A, B, C, D (不区分大小写)
  const directMatch = option.match(/^[ABCD]$/i);
  if (directMatch) {
    return directMatch[0].toUpperCase();
  }
  
  // 2. 匹配包含字母的格式，如 "选项A", "答案B", "A选项", "(A)", "A.", "A："等
  const letterMatch = option.match(/[ABCD]/i);
  if (letterMatch) {
    const extractedLetter = letterMatch[0].toUpperCase();
    console.log(`第${questionNumber}题 - 从 "${option}" 中提取到: ${extractedLetter}`);
    return extractedLetter;
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
      console.log(`第${questionNumber}题 - 将 "${key}" 转换为 "${value}"`);
      return value;
    }
  }
  
  // 4. 智能修复：如果是 E、F 等无效字母，尝试自动修复为 A-D
  const invalidLetterMatch = option.match(/[EFGH]/i);
  if (invalidLetterMatch) {
    const invalidLetter = invalidLetterMatch[0].toUpperCase();
    let fixedLetter;
    
    // 将 E->A, F->B, G->C, H->D 的简单映射
    switch (invalidLetter) {
      case 'E': fixedLetter = 'A'; break;
      case 'F': fixedLetter = 'B'; break;
      case 'G': fixedLetter = 'C'; break;
      case 'H': fixedLetter = 'D'; break;
      default: fixedLetter = 'A'; // 默认修复为A
    }
    
    console.warn(`第${questionNumber}题 - 检测到无效答案 "${invalidLetter}"，自动修复为 "${fixedLetter}"`);
    return fixedLetter;
  }
  
  // 5. 尝试通过选项内容匹配
  const optionContents = [quiz.option_a, quiz.option_b, quiz.option_c, quiz.option_d];
  const optionLabels = ['A', 'B', 'C', 'D'];
  
  for (let i = 0; i < optionContents.length; i++) {
    if (optionContents[i] && option.includes(optionContents[i].substring(0, 10))) {
      console.log(`第${questionNumber}题 - 通过选项内容匹配到: ${optionLabels[i]}`);
      return optionLabels[i];
    }
  }
  
  // 6. 最后的尝试：如果包含任何数字，转换为对应字母
  const anyNumber = option.match(/[1-4]/);
  if (anyNumber) {
    const num = parseInt(anyNumber[0]);
    if (num >= 1 && num <= 4) {
      const fixedLetter = String.fromCharCode(64 + num); // 1->A, 2->B, 3->C, 4->D
      console.log(`第${questionNumber}题 - 从数字 "${num}" 转换为 "${fixedLetter}"`);
      return fixedLetter;
    }
  }
  
  console.error(`第${questionNumber}题 - 无法识别的正确答案格式: "${option}"`);
  return null;
}

module.exports = {
  generateQuizFromText
};
