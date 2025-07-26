const answerModel = require('../models/answerModel');

// 新增：讲座整体统计和分组统计接口，返回 lectureStats 和 groupStats
const getLectureStats = async (req, res) => {
  const lectureId = req.params.lectureId;
  try {
    // 讲座整体统计
    const lectureStats = await answerModel.getLectureQuizStats(lectureId);
    // 分组统计（可选：如有 groupStats 相关表/方法）
    // 这里只做简单示例，实际可根据你分组表结构调整
    const [groupStatsRows] = await answerModel.pool.promise().query(
      'SELECT group_id, lecture_id, COUNT(DISTINCT quiz_id) as questions_count, COUNT(DISTINCT user_id) as participants_count, COUNT(*) as total_answers, SUM(is_correct) as correct_answers, ROUND(SUM(is_correct) * 100.0 / COUNT(*), 2) as accuracy_rate, AVG(answer_time_ms) as avg_answer_time_ms FROM quiz_answers WHERE lecture_id = ? GROUP BY group_id, lecture_id',
      [lectureId]
    );
    res.json({
      success: true,
      data: {
        lectureStats: lectureStats || {},
        groupStats: groupStatsRows || []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getLectureStats };
