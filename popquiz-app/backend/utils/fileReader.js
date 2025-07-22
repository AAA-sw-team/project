//进行文件解析模块
const fs = require('fs');
const pdf = require('pdf-parse');
const pptx2json = require('pptx2json'); // 使用 pptx2json 解析 pptx 文件
const mammoth = require('mammoth'); // docx 支持

async function extractTextFromFile(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();

  if (ext === 'pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } else if (ext === 'pptx') {
    // pptx2json 返回 Promise，解析后 result.slides 是数组
    const result = await pptx2json.parse(filePath);
    // result.slides 每个 slide.texts 是数组，需合并
    const text = result.slides.map(slide => (slide.texts || []).join(' ')).join('\n');
    return text;
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
