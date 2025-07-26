const express = require('express');
const router = express.Router();
const pool = require('../models/db');
const authMiddleware = require('../middleware/authMiddleware');

// 调试接口：查看用户在特定讲座的状态
router.get('/debug/user-status/:lectureId', authMiddleware, async (req, res) => {
  const lectureId = req.params.lectureId;
  const userId = req.user.userId || req.user.id;

  try {
    console.log(`[DEBUG] 查询用户状态 - 讲座ID: ${lectureId}, 用户ID: ${userId}`);
    
    // 查询用户在该讲座的状态
    const [rows] = await pool.promise().query(
      'SELECT * FROM lecture_participants WHERE lecture_id = ? AND user_id = ?',
      [lectureId, userId]
    );

    console.log(`[DEBUG] 查询结果:`, rows);

    if (rows.length === 0) {
      return res.json({
        success: true,
        message: '用户从未加入过这个讲座',
        data: null
      });
    }

    const status = rows[0];
    res.json({
      success: true,
      message: '查询成功',
      data: {
        id: status.id,
        lecture_id: status.lecture_id,
        user_id: status.user_id,
        status: status.status,
        joined_at: status.joined_at,
        left_at: status.left_at,
        last_seen: status.last_seen
      }
    });

  } catch (error) {
    console.error('[DEBUG] 查询用户状态失败:', error);
    res.status(500).json({
      success: false,
      error: '查询失败',
      detail: error.message
    });
  }
});

// 调试接口：强制更新用户状态为left（用于测试）
router.post('/debug/force-leave/:lectureId', authMiddleware, async (req, res) => {
  const lectureId = req.params.lectureId;
  const userId = req.user.userId || req.user.id;

  try {
    console.log(`[DEBUG] 强制设置用户离开 - 讲座ID: ${lectureId}, 用户ID: ${userId}`);
    
    const [result] = await pool.promise().query(
      `UPDATE lecture_participants 
       SET left_at = NOW(), status = 'left' 
       WHERE lecture_id = ? AND user_id = ?`,
      [lectureId, userId]
    );

    console.log(`[DEBUG] 更新结果:`, {
      affectedRows: result.affectedRows,
      changedRows: result.changedRows
    });

    // 查询更新后的状态
    const [rows] = await pool.promise().query(
      'SELECT * FROM lecture_participants WHERE lecture_id = ? AND user_id = ?',
      [lectureId, userId]
    );

    res.json({
      success: true,
      message: `更新了 ${result.affectedRows} 行记录`,
      data: rows[0] || null
    });

  } catch (error) {
    console.error('[DEBUG] 强制离开失败:', error);
    res.status(500).json({
      success: false,
      error: '操作失败',
      detail: error.message
    });
  }
});

module.exports = router;
