
const {
  createLecture_db,
  getAllLectures_db,
  getLecturesByUser_db,
  deleteLectureById,
  getLectureById,
  updateLectureStatus
} = require('../models/lectureModel');
const { getLectureParticipantCount } = require('../models/participantModel');
const pool = require('../models/db');

/* 创建讲座
   POST /api/lectures
   讲者专用，需登录
   请求体: { title, description }
   返回: { message, lecture: { id, title, name, created_at } }
*/
async function createLecture(req, res) {
  const { title, description } = req.body;
  const user = req.user;
  // name 必填
  if (user.role !== 'speaker' || !user.name) {
    return res.status(403).json({ error: '只有讲者可以创建讲座，且必须填写讲者姓名' });
  }
  if (!title || !description) {
    return res.status(400).json({ error: '标题和描述不能为空' });
  }
  try {
    // 检查同一讲者是否有重复标题
    const [dupRows] = await pool.promise().query(
      'SELECT id FROM lectures WHERE speaker_id = ? AND title = ?',
      [user.userId, title]
    );
    if (dupRows.length > 0) {
      return res.status(409).json({ error: '同一个讲者不能创建重复标题的讲座' });
    }
    // 创建讲座
    const [result] = await createLecture_db(title, description, user.userId, user.name);
    const [rows] = await pool.promise().query('SELECT id, title, name, created_at FROM lectures WHERE id = ?', [result.insertId]);
    const lectureInfo = rows[0];
    res.json({ message: '讲座创建成功', lecture: lectureInfo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '数据库错误' });
  }
};

/**
 * 结束讲座
 * POST /api/lectures/:id/end
 * 讲者专用，需登录
 * 返回: { message, lectureId }
 */
async function endLecture(req, res) {
  const lectureId = req.params.id;
  const userId = req.user.userId || req.user.id;
  try {
    const [rows] = await pool.promise().query('SELECT * FROM lectures WHERE id = ?', [lectureId]);
    if (!rows.length) {
      return res.status(404).json({ error: '讲座不存在' });
    }
    if (rows[0].speaker_id !== userId) {
      return res.status(403).json({ error: '只能结束自己创建的讲座' });
    }
    await updateLectureStatus(lectureId, 1);
    res.json({ message: '讲座已结束', lectureId });
  } catch (err) {
    console.error('[lectureController] 结束讲座失败:', err.message);
    res.status(500).json({ error: '结束讲座失败', detail: err.message });
  }
};

/**
 * 获取全部讲座
 * GET /api/lectures
 * 公开接口
 * 返回: [{ id, title, name, created_at, participant_count }]
 */
async function getAllLectures(req, res) {
  try {
    const [rows] = await getAllLectures_db();
    const result = [];
    for (const item of rows) {
      const participantCount = await getLectureParticipantCount(item.id);
      result.push({
        id: item.id,
        title: item.title,
        name: item.name,
        created_at: item.created_at,
        status: item.status,
        participant_count: participantCount
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: '获取讲座失败' });
  }
};

/**
 * 获取当前用户的讲座
 * GET /api/lectures/my
 * 需登录
 * 返回: [{ id, title, name, created_at }]
 */
async function getLecturesByUser(req, res) {
  try {
    const [rows] = await getLecturesByUser_db(req.user.userId || req.user.id);
    const result = rows.map(item => ({
      id: item.id,
      title: item.title,
      name: item.name,
      description: item.description, // 新增
      created_at: item.created_at
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: '获取我的讲座失败' });
  }
};

/**
 * 删除讲座
 * DELETE /api/lectures/:id
 * 讲者专用，需登录
 * 返回: { message }
 */
async function deleteLecture(req, res) {
  try {
    const [result] = await deleteLectureById(req.params.id, req.user.id || req.user.userId);
    if (result.affectedRows === 0) {
      return res.status(403).json({ error: '不能删除不是你创建的讲座' });
    }
    res.json({ message: '讲座已删除' });
  } catch (err) {
    res.status(500).json({ error: '删除失败' });
  }
};

/**
 * 获取讲座详情
 * GET /api/lectures/:id
 * 需登录
 * 返回: { lecture, files, quizzes, participant_count }
 */
async function getLectureDetail(req, res) {
  const lectureId = req.params.id;
  try {
    // 获取讲座基本信息
    const [lectureRows] = await getLectureById(lectureId);
    if (!lectureRows.length) {
      return res.status(404).json({ error: '讲座不存在' });
    }
    const lecture = lectureRows[0];
    
    // 获取讲座文件列表
    const [fileRows] = await pool.promise().query('SELECT id, filename, filepath, filetype, uploaded_at FROM files WHERE lecture_id = ? ORDER BY created_at DESC', [lectureId]);
    
    // 获取讲座题目列表
    const [quizRows] = await pool.promise().query('SELECT id, question, option_a, option_b, option_c, option_d, correct_option, published, created_at FROM quizzes WHERE lecture_id = ? ORDER BY created_at DESC', [lectureId]);
    
    // 获取参与者数量
    const participantCount = await getLectureParticipantCount(lectureId);
    
    // 字段筛选
    const lectureInfo = {
      id: lecture.id,
      title: lecture.title,
      name: lecture.name,
      created_at: lecture.created_at,
      status: lecture.status,
      participant_count: participantCount
    };
    
    const filesInfo = fileRows.map(f => ({
      id: f.id,
      filename: f.filename,
      uploaded_at: f.uploaded_at
    }));
    
    const quizzesInfo = quizRows.map(q => ({
      id: q.id,
      question: q.question,
      published: q.published,
      created_at: q.created_at
    }));
    
    res.json({
      lecture: lectureInfo,
      files: filesInfo,
      quizzes: quizzesInfo
    });
  } catch (err) {
    console.error('[lectureController] 获取讲座详情失败:', err.message);
    res.status(500).json({ error: '获取讲座详情失败', detail: err.message });
  }
}

module.exports = {
  createLecture,
  endLecture,
  getAllLectures,
  getLecturesByUser,
  deleteLecture,
  getLectureDetail,
};
