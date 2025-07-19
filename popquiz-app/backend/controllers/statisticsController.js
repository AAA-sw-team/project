const statisticsModel = require('../models/statisticsModel');

const getLectureStats = async (req, res) => {
  const lectureId = req.params.lectureId;
  try {
    const overallStats = await statisticsModel.getLectureOverallStats(lectureId);
    const rankings = await statisticsModel.getUserRankings(lectureId);

    res.json({
      overallStats,
      rankings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
};

module.exports = {
  getLectureStats
};
