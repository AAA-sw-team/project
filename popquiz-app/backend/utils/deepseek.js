// 调用deepseek API 生成单项选择题
// 需要安装 axios 和 dotenv

const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:11434/api/generate';
//const API_KEY = process.env.DEEPSEEK_API_KEY;

async function generateQuizFromText(inputText) {
  const prompt = `
你是一个专业的 AI 出题助手以及一名优秀的命题老师，现在想要检查学生的听课情况，接下来我会给你一段讲座内容，请基于这段内容生成 5 道单项选择题（带四个选项和标准答案）。

要求如下：
1. 每题一个问题，4 个选项（A、B、C、D），只有一个正确答案。
2. 问题应覆盖不同的知识点，避免重复。
3. 使用中文出题，内容清晰严谨，贴近讲座重点。
4. 返回格式必须是 JSON 数组，只输出 JSON，不要输出任何解释或标签。
5. 请严格按照如下格式：
[
  {
    "question": "问题内容？",
    "option_a": "选项A",
    "option_b": "选项B",
    "option_c": "选项C",
    "option_d": "选项D",
    "correct_option": "A"
  },
  ...
]

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
    // 提取第一个 [ 到最后一个 ] 之间的内容，防止带标签或多余内容
    const jsonMatch = result.match(/\[.*\]/s);
    if (!jsonMatch) throw new Error('AI 返回内容中未找到 JSON 数组');
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error('AI 调用失败:', error.message);
    throw error;
  }
}

module.exports = {
  generateQuizFromText
};
