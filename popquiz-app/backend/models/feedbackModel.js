const db = require('./db');

class FeedbackModel {
    // 提交反馈
    static async submitFeedback(lectureId, userId, feedbackType, feedbackMessage = null) {
        const query = `
            INSERT INTO lecture_feedback (lecture_id, user_id, feedback_type, feedback_message)
            VALUES (?, ?, ?, ?)
        `;
        
        try {
            const [result] = await db.execute(query, [lectureId, userId, feedbackType, feedbackMessage]);
            return {
                success: true,
                feedbackId: result.insertId,
                message: '反馈提交成功'
            };
        } catch (error) {
            console.error('提交反馈失败:', error);
            throw error;
        }
    }

    // 获取讲座的所有反馈（讲师用）
    static async getLectureFeedback(lectureId, page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        
        const query = `
            SELECT 
                lf.id,
                lf.feedback_type,
                lf.feedback_message,
                lf.created_at,
                u.username,
                u.email
            FROM lecture_feedback lf
            JOIN users u ON lf.user_id = u.id
            WHERE lf.lecture_id = ?
            ORDER BY lf.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        try {
            const [feedbacks] = await db.execute(query, [lectureId, limit, offset]);
            
            // 获取总数
            const countQuery = `SELECT COUNT(*) as total FROM lecture_feedback WHERE lecture_id = ?`;
            const [countResult] = await db.execute(countQuery, [lectureId]);
            
            return {
                feedbacks,
                pagination: {
                    page,
                    limit,
                    total: countResult[0].total,
                    totalPages: Math.ceil(countResult[0].total / limit)
                }
            };
        } catch (error) {
            console.error('获取讲座反馈失败:', error);
            throw error;
        }
    }

    // 获取讲座反馈统计
    static async getLectureFeedbackStats(lectureId) {
        const query = `
            SELECT 
                feedback_type,
                COUNT(*) as count,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lecture_feedback WHERE lecture_id = ?), 2) as percentage
            FROM lecture_feedback 
            WHERE lecture_id = ?
            GROUP BY feedback_type
            ORDER BY count DESC
        `;
        
        try {
            const [stats] = await db.execute(query, [lectureId, lectureId]);
            
            // 获取最近的反馈
            const recentQuery = `
                SELECT 
                    lf.feedback_type,
                    lf.feedback_message,
                    lf.created_at,
                    u.username
                FROM lecture_feedback lf
                JOIN users u ON lf.user_id = u.id
                WHERE lf.lecture_id = ?
                ORDER BY lf.created_at DESC
                LIMIT 10
            `;
            const [recentFeedback] = await db.execute(recentQuery, [lectureId]);
            
            // 获取总反馈数
            const totalQuery = `SELECT COUNT(*) as total FROM lecture_feedback WHERE lecture_id = ?`;
            const [totalResult] = await db.execute(totalQuery, [lectureId]);
            
            return {
                stats,
                recentFeedback,
                totalCount: totalResult[0].total
            };
        } catch (error) {
            console.error('获取反馈统计失败:', error);
            throw error;
        }
    }

    // 获取用户在特定讲座的反馈历史
    static async getUserFeedbackHistory(lectureId, userId) {
        const query = `
            SELECT 
                id,
                feedback_type,
                feedback_message,
                created_at
            FROM lecture_feedback
            WHERE lecture_id = ? AND user_id = ?
            ORDER BY created_at DESC
        `;
        
        try {
            const [history] = await db.execute(query, [lectureId, userId]);
            return history;
        } catch (error) {
            console.error('获取用户反馈历史失败:', error);
            throw error;
        }
    }

    // 检查用户是否可以提交反馈（防止垃圾反馈）
    static async canSubmitFeedback(lectureId, userId) {
        // 检查用户是否已加入讲座
        const participantQuery = `
            SELECT 1 FROM lecture_participants 
            WHERE lecture_id = ? AND user_id = ? AND status = 'joined'
        `;
        const [participant] = await db.execute(participantQuery, [lectureId, userId]);
        
        if (participant.length === 0) {
            return { canSubmit: false, reason: '您需要先加入讲座才能提交反馈' };
        }

        // 检查讲座状态
        const lectureQuery = `SELECT status FROM lectures WHERE id = ?`;
        const [lecture] = await db.execute(lectureQuery, [lectureId]);
        
        if (lecture.length === 0) {
            return { canSubmit: false, reason: '讲座不存在' };
        }

        if (lecture[0].status !== 'active') {
            return { canSubmit: false, reason: '只能在进行中的讲座提交反馈' };
        }

        // 检查最近5分钟内是否已提交过多反馈（防止刷屏）
        const recentQuery = `
            SELECT COUNT(*) as count 
            FROM lecture_feedback 
            WHERE lecture_id = ? AND user_id = ? 
            AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        `;
        const [recent] = await db.execute(recentQuery, [lectureId, userId]);
        
        if (recent[0].count >= 3) {
            return { canSubmit: false, reason: '请不要频繁提交反馈，请等待5分钟后再试' };
        }

        return { canSubmit: true };
    }

    // 获取反馈类型说明
    static getFeedbackTypes() {
        return {
            too_fast: '讲得太快了',
            too_slow: '讲得太慢了',
            too_hard: '内容太难了',
            too_easy: '内容太简单了',
            unclear: '讲解不清楚',
            good: '讲得很好',
            need_repeat: '需要重复一遍',
            volume_low: '声音太小了',
            volume_high: '声音太大了',
            other: '其他'
        };
    }
}

module.exports = FeedbackModel;
