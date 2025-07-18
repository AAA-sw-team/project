const fs = require('fs');
const pdf = require('pdf-parse');
const pptxParser = require('pptx-parser'); // 使用 pptx-parser 解析 pptx 文件
const mammoth = require('mammoth'); // docx 支持

async function extractTextFromFile(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();

  if (ext === 'pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } else if (ext === 'pptx') {
    return new Promise((resolve, reject) => {
      pptxParser(filePath, (err, result) => {
        if (err) reject(err);
        const text = result.map(slide => slide.text).join('\n');
        resolve(text);
      });
    });
  } else if (ext === 'txt') {
    return fs.readFileSync(filePath, 'utf8');
  } else if (ext === 'docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } else {
    throw new Error('不支持的文件类型');
  }
}

module.exports = { extractTextFromFile };
