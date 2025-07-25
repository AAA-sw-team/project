const participantModel = require('../models/participantModel');
const pool = require('../models/db');

/**
 * 查看已结束讲座的详细信息（包括题目、答案、统计）
 * GET /api/participants/lecture-review/:lectureId
 * 需要登录，听众可以查看自己参与过的已结束讲座
 */
const getLectureReview = async (req, res) => {
  const lectureId = req.params.lectureId;
  const userId = req.user.userId || req.user.id;

  try {
    // 检查讲座是否存在
    const [lectureRows] = await pool.promise().query('SELECT * FROM lectures WHERE id = ?', [lectureId]);
    if (!lectureRows.length) {
      return res.status(404).json({ error: '讲座不存在' });
    }

    const lecture = lectureRows[0];
    
    // 检查讲座是否已结束
    if (lecture.status !== 1) {
      return res.status(400).json({ error: '只能查看已结束的讲座详情' });
    }

    // 检查用户是否参与过这个讲座（已加入或曾经加入过）
    const [participantRows] = await pool.promise().query(
      'SELECT * FROM lecture_participants WHERE lecture_id = ? AND user_id = ?', 
      [lectureId, userId]
    );
    
    if (!participantRows.length) {
      return res.status(403).json({ error: '您没有参与过这个讲座，无法查看详情' });
    }

    // 获取讲座的所有题目
    const [quizRows] = await pool.promise().query(
      `SELECT id, question, option_a, option_b, option_c, option_d, correct_option, created_at 
       FROM quizzes WHERE lecture_id = ? ORDER BY created_at ASC`,
      [lectureId]
    );

    // 获取用户的答题记录
    const [answerRows] = await pool.promise().query(
      `SELECT qa.quiz_id, qa.selected_option, qa.is_correct, qa.answered_at
       FROM quiz_answers qa
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE q.lecture_id = ? AND qa.user_id = ?`,
      [lectureId, userId]
    );

    // 创建答案映射
    const userAnswers = {};
    answerRows.forEach(answer => {
      userAnswers[answer.quiz_id] = {
        selected_option: answer.selected_option,
        is_correct: answer.is_correct,
        answered_at: answer.answered_at
      };
    });

    // 整合题目和答案信息
    const quizzesWithAnswers = quizRows.map(quiz => ({
      id: quiz.id,
      question: quiz.question,
      options: {
        A: quiz.option_a,
        B: quiz.option_b,
        C: quiz.option_c,
        D: quiz.option_d
      },
      correct_option: quiz.correct_option,
      user_answer: userAnswers[quiz.id] ? {
        selected_option: userAnswers[quiz.id].selected_option,
        is_correct: userAnswers[quiz.id].is_correct,
        answered_at: userAnswers[quiz.id].answered_at
      } : null,
      created_at: quiz.created_at
    }));

    // 计算用户的统计信息
    const totalQuizzes = quizRows.length;
    const answeredQuizzes = answerRows.length;
    const correctAnswers = answerRows.filter(answer => answer.is_correct).length;
    const answerRate = totalQuizzes > 0 ? (answeredQuizzes / totalQuizzes * 100) : 0;
    const correctRate = answeredQuizzes > 0 ? (correctAnswers / answeredQuizzes * 100) : 0;

    // 获取讲座整体统计（所有参与者的表现）
    const [overallStatsRows] = await pool.promise().query(
      `SELECT 
        COUNT(DISTINCT qa.user_id) as total_participants,
        COUNT(qa.id) as total_answers,
        SUM(qa.is_correct) as total_correct_answers,
        AVG(qa.is_correct) * 100 as overall_correct_rate
       FROM quiz_answers qa
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE q.lecture_id = ?`,
      [lectureId]
    );

    const overallStats = overallStatsRows[0];

    // 获取用户在所有参与者中的排名
    const [rankingRows] = await pool.promise().query(
      `SELECT 
        u.id as user_id,
        u.nickname,
        COUNT(qa.id) as answered_count,
        SUM(qa.is_correct) as correct_count,
        (SUM(qa.is_correct) / COUNT(qa.id) * 100) as accuracy
       FROM users u
       JOIN quiz_answers qa ON u.id = qa.user_id
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE q.lecture_id = ?
       GROUP BY u.id, u.nickname
       HAVING answered_count > 0
       ORDER BY accuracy DESC, correct_count DESC`,
      [lectureId]
    );

    let userRank = null;
    rankingRows.forEach((participant, index) => {
      if (participant.user_id === userId) {
        userRank = {
          rank: index + 1,
          total_participants: rankingRows.length,
          accuracy: participant.accuracy,
          answered_count: participant.answered_count,
          correct_count: participant.correct_count
        };
      }
    });

    const result = {
      lecture: {
        id: lecture.id,
        title: lecture.title,
        description: lecture.description,
        speaker_name: lecture.name,
        created_at: lecture.created_at,
        status: lecture.status
      },
      quizzes: quizzesWithAnswers,
      user_statistics: {
        total_quizzes: totalQuizzes,
        answered_quizzes: answeredQuizzes,
        correct_answers: correctAnswers,
        answer_rate: Math.round(answerRate * 100) / 100,
        correct_rate: Math.round(correctRate * 100) / 100,
        ranking: userRank
      },
      overall_statistics: {
        total_participants: overallStats.total_participants || 0,
        total_answers: overallStats.total_answers || 0,
        total_correct_answers: overallStats.total_correct_answers || 0,
        overall_correct_rate: Math.round((overallStats.overall_correct_rate || 0) * 100) / 100
      }
    };

    res.json(result);
  } catch (err) {
    console.error('[participantController] 获取讲座复习详情失败:', err.message);
    res.status(500).json({ error: '获取讲座复习详情失败', detail: err.message });
  }
};

/**
 * 听众加入讲座
 * POST /api/participants/join/:lectureId
 * 需要登录，只有listener角色可以加入
 */
const joinLecture = async (req, res) => {
  const lectureId = req.params.lectureId;
  const userId = req.user.userId || req.user.id;
  const userRole = req.user.role;

  try {
    // 检查用户角色，只有听众可以加入讲座
    if (userRole !== 'listener') {
      return res.status(403).json({ error: '只有听众可以加入讲座' });
    }

    // 检查讲座是否存在
    const [lectureRows] = await pool.promise().query('SELECT * FROM lectures WHERE id = ?', [lectureId]);
    if (!lectureRows.length) {
      return res.status(404).json({ error: '讲座不存在' });
    }

    const lecture = lectureRows[0];
    
    // 检查讲座是否已结束
    if (lecture.status === 2) {
      return res.status(400).json({ error: '讲座已结束，无法加入' });
    }

    // 检查用户是否已经加入
    const isAlreadyJoined = await participantModel.isUserInLecture(lectureId, userId);
    if (isAlreadyJoined) {
      return res.status(400).json({ error: '您已经加入了这个讲座' });
    }

    // 加入讲座
    await participantModel.joinLecture(lectureId, userId);

    res.json({ 
      message: '成功加入讲座',
      lecture: {
        id: lecture.id,
        title: lecture.title,
        speaker_name: lecture.name
      }
    });
  } catch (err) {
    console.error('[participantController] 加入讲座失败:', err.message);
    res.status(500).json({ error: '加入讲座失败', detail: err.message });
  }
};

/**
 * 听众退出讲座
 * POST /api/participants/leave/:lectureId
 * 需要登录
 */
const leaveLecture = async (req, res) => {
  const lectureId = req.params.lectureId;
  const userId = req.user.userId || req.user.id;

  try {
    // 检查用户是否已加入讲座
    const isJoined = await participantModel.isUserInLecture(lectureId, userId);
    if (!isJoined) {
      return res.status(400).json({ error: '您尚未加入这个讲座' });
    }

    // 退出讲座
    const [result] = await participantModel.leaveLecture(lectureId, userId);
    
    if (result.affectedRows === 0) {
      return res.status(400).json({ error: '退出讲座失败' });
    }

    res.json({ message: '成功退出讲座' });
  } catch (err) {
    console.error('[participantController] 退出讲座失败:', err.message);
    res.status(500).json({ error: '退出讲座失败', detail: err.message });
  }
};

/**
 * 获取用户加入的所有讲座（进行中的）
 * GET /api/participants/my-lectures
 * 需要登录
 */
const getMyJoinedLectures = async (req, res) => {
  const userId = req.user.userId || req.user.id;

  try {
    const lectures = await participantModel.getUserJoinedLectures(userId);
    
    const result = lectures.map(item => ({
      id: item.lecture_id,
      title: item.title,
      desc: item.description,
      speaker: item.speaker_name,
      status: item.lecture_status, // 讲座状态：0未开始, 1进行中, 2已结束
      participant_status: item.participant_status, // 参与者状态：'joined' 或 'left'
      joined_at: item.joined_at,
      lecture_created_at: item.lecture_created_at
    }));

    res.json(result);
  } catch (err) {
    console.error('[participantController] 获取我的讲座失败:', err.message);
    res.status(500).json({ error: '获取我的讲座失败', detail: err.message });
  }
};

/**
 * 获取讲座的参与者列表
 * GET /api/participants/lecture/:lectureId
 * 需要登录，只有讲座创建者可以查看
 */
const getLectureParticipants = async (req, res) => {
  const lectureId = req.params.lectureId;
  const userId = req.user.userId || req.user.id;

  try {
    // 检查讲座是否存在以及用户权限
    const [lectureRows] = await pool.promise().query('SELECT * FROM lectures WHERE id = ?', [lectureId]);
    if (!lectureRows.length) {
      return res.status(404).json({ error: '讲座不存在' });
    }

    const lecture = lectureRows[0];
    
    // 只有讲座创建者可以查看参与者列表
    if (lecture.speaker_id !== userId) {
      return res.status(403).json({ error: '只有讲座创建者可以查看参与者列表' });
    }

    const participants = await participantModel.getLectureParticipants(lectureId);
    const participantCount = await participantModel.getLectureParticipantCount(lectureId);

    const result = {
      lecture: {
        id: lecture.id,
        title: lecture.title,
        speaker_name: lecture.name
      },
      participant_count: participantCount,
      participants: participants.map(p => ({
        user_id: p.user_id,
        username: p.username,
        nickname: p.nickname,
        joined_at: p.joined_at
      }))
    };

    res.json(result);
  } catch (err) {
    console.error('[participantController] 获取参与者列表失败:', err.message);
    res.status(500).json({ error: '获取参与者列表失败', detail: err.message });
  }
};

/**
 * 检查用户是否已加入讲座
 * GET /api/participants/check/:lectureId
 * 需要登录
 */
const checkJoinStatus = async (req, res) => {
  const lectureId = req.params.lectureId;
  const userId = req.user.userId || req.user.id;

  try {
    const isJoined = await participantModel.isUserInLecture(lectureId, userId);
    res.json({ 
      isJoined,
      lectureId: parseInt(lectureId),
      userId 
    });
  } catch (err) {
    console.error('[participantController] 检查加入状态失败:', err.message);
    res.status(500).json({ error: '检查加入状态失败', detail: err.message });
  }
};

/**
 * 检查用户是否曾经加入过讲座（历史记录）
 * GET /api/participants/check-history/:lectureId
 * 需要登录
 */
const checkHasEverJoined = async (req, res) => {
  const lectureId = req.params.lectureId;
  const userId = req.user.userId || req.user.id;

  try {
    const hasJoined = await participantModel.hasUserEverJoined(lectureId, userId);
    res.json({ 
      hasJoined,
      lectureId: parseInt(lectureId),
      userId 
    });
  } catch (err) {
    console.error('[participantController] 检查历史加入状态失败:', err.message);
    res.status(500).json({ error: '检查历史加入状态失败', detail: err.message });
  }
};

/**
 * 获取已结束的讲座列表（供用户查看历史讲座）
 * GET /api/participants/finished-lectures
 * 需要登录
 */
const getFinishedLectures = async (req, res) => {
  const userId = req.user.userId || req.user.id;

  try {
    // 获取用户参与过的已结束讲座
    const [lectures] = await pool.promise().query(
      `SELECT DISTINCT
        l.id, l.title, l.description, l.status, l.created_at,
        u.nickname as speaker_name,
        lp.joined_at,
        COUNT(DISTINCT q.id) as total_quizzes,
        COUNT(DISTINCT qa.id) as answered_quizzes,
        SUM(CASE WHEN qa.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers
       FROM lecture_participants lp
       JOIN lectures l ON lp.lecture_id = l.id
       JOIN users u ON l.speaker_id = u.id
       LEFT JOIN quizzes q ON l.id = q.lecture_id AND q.published = 1
       LEFT JOIN quiz_answers qa ON q.id = qa.quiz_id AND qa.user_id = ?
       WHERE lp.user_id = ? AND l.status = 1
       GROUP BY l.id, l.title, l.description, l.status, l.created_at, u.nickname, lp.joined_at
       ORDER BY l.created_at DESC`,
      [userId, userId]
    );

    const result = lectures.map(lecture => ({
      id: lecture.id,
      title: lecture.title,
      description: lecture.description,
      speaker_name: lecture.speaker_name,
      status: lecture.status,
      status_text: '已结束',
      joined_at: lecture.joined_at,
      created_at: lecture.created_at,
      quiz_summary: {
        total_quizzes: lecture.total_quizzes || 0,
        answered_quizzes: lecture.answered_quizzes || 0,
        correct_answers: lecture.correct_answers || 0,
        accuracy: lecture.answered_quizzes > 0 
          ? Math.round((lecture.correct_answers / lecture.answered_quizzes) * 10000) / 100 
          : 0
      }
    }));

    res.json(result);
  } catch (err) {
    console.error('[participantController] 获取已结束讲座失败:', err.message);
    res.status(500).json({ error: '获取已结束讲座失败', detail: err.message });
  }
};

/**
 * 获取讲座参与者数量
 * GET /api/participants/count/:lectureId
 * 公开接口，任何人都可以查看
 */
const getLectureParticipantCount = async (req, res) => {
  const lectureId = req.params.lectureId;

  try {
    // 检查讲座是否存在
    const [lectureRows] = await pool.promise().query('SELECT * FROM lectures WHERE id = ?', [lectureId]);
    if (!lectureRows.length) {
      return res.status(404).json({ error: '讲座不存在' });
    }

    const lecture = lectureRows[0];
    
    // 获取当前参与者数量
    const participantCount = await participantModel.getLectureParticipantCount(lectureId);
    
    // 获取在线参与者数量（最近5分钟内有活动的）
    const [onlineRows] = await pool.promise().query(
      `SELECT COUNT(DISTINCT user_id) as online_count 
       FROM lecture_participants 
       WHERE lecture_id = ? 
       AND status = 'joined' 
       AND last_seen >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)`,
      [lectureId]
    );
    
    const onlineCount = onlineRows[0].online_count || 0;

    const result = {
      lecture_id: parseInt(lectureId),
      lecture_title: lecture.title,
      lecture_status: lecture.status,
      total_participants: participantCount,
      online_participants: onlineCount,
      updated_at: new Date().toISOString()
    };

    res.json(result);
  } catch (err) {
    console.error('[participantController] 获取参与者数量失败:', err.message);
    res.status(500).json({ error: '获取参与者数量失败', detail: err.message });
  }
};

/**
 * 更新用户最后活跃时间（心跳接口）
 * POST /api/participants/heartbeat/:lectureId
 * 需要登录
 */
const updateHeartbeat = async (req, res) => {
  const lectureId = req.params.lectureId;
  const userId = req.user.userId || req.user.id;

  try {
    // 检查用户是否已加入讲座
    const isJoined = await participantModel.isUserInLecture(lectureId, userId);
    if (!isJoined) {
      return res.status(403).json({ error: '用户未加入此讲座' });
    }

    // 更新最后活跃时间
    await pool.promise().query(
      'UPDATE lecture_participants SET last_seen = NOW() WHERE lecture_id = ? AND user_id = ?',
      [lectureId, userId]
    );

    res.json({ 
      success: true, 
      message: '心跳更新成功',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[participantController] 更新心跳失败:', err.message);
    res.status(500).json({ error: '更新心跳失败', detail: err.message });
  }
};

module.exports = {
  joinLecture,
  leaveLecture,
  getMyJoinedLectures,
  getLectureParticipants,
  checkJoinStatus,
  checkHasEverJoined,
  getLectureReview,
  getFinishedLectures,
  getLectureParticipantCount,
  updateHeartbeat
};
