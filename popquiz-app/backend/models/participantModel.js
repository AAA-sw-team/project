const pool = require('./db');

/**
 * 听众加入讲座
 */
async function joinLecture(lectureId, userId) {
  // 使用 INSERT ... ON DUPLICATE KEY UPDATE 来处理重复加入的情况
  const sql = `
    INSERT INTO lecture_participants (lecture_id, user_id, joined_at, status, last_seen) 
    VALUES (?, ?, NOW(), 'joined', NOW())
    ON DUPLICATE KEY UPDATE 
      joined_at = NOW(), 
      left_at = NULL, 
      status = 'joined',
      last_seen = NOW()
  `;
  return pool.promise().query(sql, [lectureId, userId]);
}

/**
 * 听众退出讲座
 */
async function leaveLecture(lectureId, userId) {
  const sql = `
    UPDATE lecture_participants 
    SET left_at = NOW(), status = 'left' 
    WHERE lecture_id = ? AND user_id = ?
  `;
  return pool.promise().query(sql, [lectureId, userId]);
}

/**
 * 检查用户是否已加入讲座（当前状态为joined）
 */
async function isUserInLecture(lectureId, userId) {
  const sql = `
    SELECT * FROM lecture_participants 
    WHERE lecture_id = ? AND user_id = ? AND status = 'joined'
  `;
  const [rows] = await pool.promise().query(sql, [lectureId, userId]);
  return rows.length > 0;
}

/**
 * 检查用户是否曾经加入过讲座（无论当前状态如何）
 */
async function hasUserEverJoined(lectureId, userId) {
  const sql = `
    SELECT * FROM lecture_participants 
    WHERE lecture_id = ? AND user_id = ?
  `;
  const [rows] = await pool.promise().query(sql, [lectureId, userId]);
  return rows.length > 0;
}

/**
 * 获取讲座的所有参与者
 */
async function getLectureParticipants(lectureId) {
  const sql = `
    SELECT lp.*, u.username, u.nickname 
    FROM lecture_participants lp
    JOIN users u ON lp.user_id = u.id
    WHERE lp.lecture_id = ? AND lp.status = 'joined'
    ORDER BY lp.joined_at DESC
  `;
  const [rows] = await pool.promise().query(sql, [lectureId]);
  return rows;
}

/**
 * 获取用户参与的所有讲座（所有状态）
 */
async function getUserJoinedLectures(userId) {
  const sql = `
    SELECT lp.lecture_id, lp.user_id, lp.joined_at, lp.left_at, 
           lp.status as participant_status,
           l.title, l.description, l.created_at as lecture_created_at, 
           l.status as lecture_status,
           u.nickname as speaker_name
    FROM lecture_participants lp
    JOIN lectures l ON lp.lecture_id = l.id
    JOIN users u ON l.speaker_id = u.id
    WHERE lp.user_id = ?
    ORDER BY lp.joined_at DESC
  `;
  const [rows] = await pool.promise().query(sql, [userId]);
  return rows;
}

/**
 * 获取讲座参与者数量
 */
async function getLectureParticipantCount(lectureId) {
  const sql = `
    SELECT COUNT(*) as count 
    FROM lecture_participants 
    WHERE lecture_id = ? AND status = 'joined'
  `;
  const [rows] = await pool.promise().query(sql, [lectureId]);
  return rows[0].count;
}

/**
 * 检查用户是否是讲座创建者
 */
async function isLectureCreator(lectureId, userId) {
  const sql = `
    SELECT COUNT(*) as count 
    FROM lectures 
    WHERE id = ? AND user_id = ?
  `;
  const [rows] = await pool.promise().query(sql, [lectureId, userId]);
  return rows[0].count > 0;
}

module.exports = {
  joinLecture,
  leaveLecture,
  isUserInLecture,
  hasUserEverJoined,
  getLectureParticipants,
  getUserJoinedLectures,
  getLectureParticipantCount,
  isLectureCreator
};
