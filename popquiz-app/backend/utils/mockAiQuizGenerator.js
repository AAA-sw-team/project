module.exports = async function generate(text) {
  return [
    {
      question: '人工智能的核心是什么？',
      a: '数据分析',
      b: '人脸识别',
      c: '模仿人类思维',
      d: '控制硬件',
      answer: 'C'
    },
    {
      question: '以下哪个不是人工智能的应用？',
      a: '语音识别',
      b: '自动驾驶',
      c: '翻译系统',
      d: '电饭煲加热',
      answer: 'D'
    }
  ];
};
