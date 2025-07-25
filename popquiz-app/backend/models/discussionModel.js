const db = require('./db');
const util = require('util');
const dbExecute = util.promisify(db.execute).bind(db);

class DiscussionModel {
    // 发送消息
    static async sendMessage(lectureId, userId, message, messageType = 'text', parentId = null, isAnonymous = false) {
        const query = `
            INSERT INTO lecture_discussions (lecture_id, user_id, message, message_type, parent_id, is_anonymous)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        try {
            const result = await dbExecute(query, [lectureId, userId, message, messageType, parentId, isAnonymous]);
            const insertId = Array.isArray(result) ? result[0]?.insertId : result.insertId;
            return {
                success: true,
                messageId: insertId,
                message: '消息发送成功'
            };
        } catch (error) {
            console.error('发送消息失败:', error);
            throw error;
        }
    }

    // 获取讨论消息（支持轮询）
    static async getDiscussionMessages(lectureId, lastMessageId = 0, limit = 50) {
        const query = `
            SELECT 
                d.id,
                d.message,
                d.message_type,
                d.parent_id,
                d.is_pinned,
                d.is_anonymous,
                d.created_at,
                d.updated_at,
                CASE WHEN d.is_anonymous = TRUE THEN '匿名用户' ELSE u.username END as username,
                CASE WHEN d.is_anonymous = TRUE THEN 'anonymous' ELSE u.role END as user_role,
                u.id as user_id,
                (SELECT COUNT(*) FROM discussion_likes dl WHERE dl.discussion_id = d.id) as like_count,
                (SELECT COUNT(*) FROM lecture_discussions replies WHERE replies.parent_id = d.id) as reply_count
            FROM lecture_discussions d
            LEFT JOIN users u ON d.user_id = u.id
            WHERE d.lecture_id = ? AND d.id > ?
            ORDER BY d.is_pinned DESC, d.created_at ASC
            LIMIT ?
        `;

        try {
            const [messages] = await dbExecute(query, [lectureId, lastMessageId, limit]);

            // 获取回复消息
            for (let message of messages) {
                if (message.reply_count > 0) {
                    const repliesQuery = `
                        SELECT 
                            d.id,
                            d.message,
                            d.created_at,
                            CASE WHEN d.is_anonymous = TRUE THEN '匿名用户' ELSE u.username END as username,
                            CASE WHEN d.is_anonymous = TRUE THEN 'anonymous' ELSE u.role END as user_role,
                            u.id as user_id
                        FROM lecture_discussions d
                        LEFT JOIN users u ON d.user_id = u.id
                        WHERE d.parent_id = ?
                        ORDER BY d.created_at ASC
                        LIMIT 10
                    `;
                    const [replies] = await dbExecute(repliesQuery, [message.id]);
                    message.replies = replies;
                } else {
                    message.replies = [];
                }
            }

            return messages;
        } catch (error) {
            console.error('获取讨论消息失败:', error);
            throw error;
        }
    }

    // 获取所有讨论消息（初始加载）
    static async getAllDiscussionMessages(lectureId, page = 1, limit = 30) {
        page = Number(page) || 1;
        limit = Number(limit) || 30;
        const offset = (page - 1) * limit;
        const query = `
            SELECT 
                d.id,
                d.message,
                d.message_type,
                d.parent_id,
                d.is_pinned,
                d.is_anonymous,
                d.created_at,
                d.updated_at,
                CASE WHEN d.is_anonymous = TRUE THEN '匿名用户' ELSE u.username END as username,
                CASE WHEN d.is_anonymous = TRUE THEN 'anonymous' ELSE u.role END as user_role,
                u.id as user_id,
                (SELECT COUNT(*) FROM discussion_likes dl WHERE dl.discussion_id = d.id) as like_count,
                (SELECT COUNT(*) FROM lecture_discussions replies WHERE replies.parent_id = d.id) as reply_count
            FROM lecture_discussions d
            LEFT JOIN users u ON d.user_id = u.id
            WHERE d.lecture_id = ? AND d.parent_id IS NULL
            ORDER BY d.is_pinned DESC, d.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        try {
            const messages = await dbExecute(query, [Number(lectureId)]);

            // 获取回复消息
            for (let message of messages) {
                if (message.reply_count > 0) {
                    const repliesQuery = `
                        SELECT 
                            d.id,
                            d.message,
                            d.created_at,
                            CASE WHEN d.is_anonymous = TRUE THEN '匿名用户' ELSE u.username END as username,
                            CASE WHEN d.is_anonymous = TRUE THEN 'anonymous' ELSE u.role END as user_role,
                            u.id as user_id
                        FROM lecture_discussions d
                        LEFT JOIN users u ON d.user_id = u.id
                        WHERE d.parent_id = ?
                        ORDER BY d.created_at ASC
                        LIMIT 10
                    `;
                    const [replies] = await dbExecute(repliesQuery, [message.id]);
                    message.replies = replies;
                } else {
                    message.replies = [];
                }
            }

            // 获取总数
            const countQuery = `SELECT COUNT(*) as total FROM lecture_discussions WHERE lecture_id = ? AND parent_id IS NULL`;
            const countResult = await dbExecute(countQuery, [lectureId]);
            const total = countResult[0]?.total ?? 0;
            return {
                messages,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('获取所有讨论消息失败:', error);
            throw error;
        }
    }

    // 点赞/取消点赞消息
    static async toggleLike(discussionId, userId) {
        try {
            // 检查是否已经点赞
            const checkQuery = `SELECT id FROM discussion_likes WHERE discussion_id = ? AND user_id = ?`;
            const existing = await dbExecute(checkQuery, [discussionId, userId]);
            if (existing.length > 0) {
                // 取消点赞
                const deleteQuery = `DELETE FROM discussion_likes WHERE discussion_id = ? AND user_id = ?`;
                await dbExecute(deleteQuery, [discussionId, userId]);
                return { success: true, action: 'unliked', message: '取消点赞成功' };
            } else {
                // 添加点赞
                const insertQuery = `INSERT INTO discussion_likes (discussion_id, user_id) VALUES (?, ?)`;
                await dbExecute(insertQuery, [discussionId, userId]);
                return { success: true, action: 'liked', message: '点赞成功' };
            }
        } catch (error) {
            console.error('切换点赞状态失败:', error);
            throw error;
        }
    }

    // 置顶/取消置顶消息（仅讲师）
    static async togglePin(discussionId, lectureId, userId) {
        try {
            // 检查讲师权限
            const ParticipantModel = require('./participantModel');
            const isCreator = await ParticipantModel.isLectureCreator(lectureId, userId);
            if (!isCreator) {
                return { success: false, message: '只有讲座创建者可以置顶消息' };
            }
            // 获取当前置顶状态
            const checkQuery = `SELECT is_pinned FROM lecture_discussions WHERE id = ? AND lecture_id = ?`;
            const result = await dbExecute(checkQuery, [discussionId, lectureId]);
            if (!result || result.length === 0) {
                return { success: false, message: '消息不存在' };
            }
            const newPinnedStatus = !result[0].is_pinned;
            const updateQuery = `UPDATE lecture_discussions SET is_pinned = ? WHERE id = ?`;
            await dbExecute(updateQuery, [newPinnedStatus, discussionId]);
            return {
                success: true,
                action: newPinnedStatus ? 'pinned' : 'unpinned',
                message: newPinnedStatus ? '消息置顶成功' : '取消置顶成功'
            };
        } catch (error) {
            console.error('切换置顶状态失败:', error);
            throw error;
        }
    }

    // 删除消息（用户删除自己的消息或讲师删除任意消息）
    static async deleteMessage(discussionId, lectureId, userId, userRole) {
        try {
            // 获取消息信息
            const messageQuery = `SELECT user_id FROM lecture_discussions WHERE id = ? AND lecture_id = ?`;
            const messageResult = await dbExecute(messageQuery, [discussionId, lectureId]);
            if (!messageResult || messageResult.length === 0) {
                return { success: false, message: '消息不存在' };
            }
            const messageUserId = messageResult[0].user_id;
            // 检查权限：消息作者或讲师可以删除
            const ParticipantModel = require('./participantModel');
            const isCreator = await ParticipantModel.isLectureCreator(lectureId, userId);
            if (messageUserId !== userId && !isCreator) {
                return { success: false, message: '没有权限删除此消息' };
            }
            // 删除消息（级联删除回复和点赞）
            const deleteQuery = `DELETE FROM lecture_discussions WHERE id = ?`;
            await dbExecute(deleteQuery, [discussionId]);
            return { success: true, message: '消息删除成功' };
        } catch (error) {
            console.error('删除消息失败:', error);
            throw error;
        }
    }

    // 获取讨论统计信息
    static async getDiscussionStats(lectureId) {
        try {
            const statsQuery = `
                SELECT 
                    COUNT(*) as total_messages,
                    COUNT(DISTINCT user_id) as active_users,
                    SUM(CASE WHEN message_type = 'question' THEN 1 ELSE 0 END) as questions,
                    SUM(CASE WHEN message_type = 'answer' THEN 1 ELSE 0 END) as answers,
                    SUM(CASE WHEN is_pinned = TRUE THEN 1 ELSE 0 END) as pinned_messages
                FROM lecture_discussions 
                WHERE lecture_id = ?
            `;

            const [stats] = await dbExecute(statsQuery, [lectureId]);

            // 获取最活跃用户
            const activeUsersQuery = `
                SELECT 
                    CASE WHEN d.is_anonymous = TRUE THEN '匿名用户' ELSE u.username END as username,
                    COUNT(*) as message_count
                FROM lecture_discussions d
                LEFT JOIN users u ON d.user_id = u.id
                WHERE d.lecture_id = ?
                GROUP BY d.user_id, d.is_anonymous
                ORDER BY message_count DESC
                LIMIT 5
            `;

            const [activeUsers] = await dbExecute(activeUsersQuery, [lectureId]);

            return {
                ...stats[0],
                activeUsers
            };
        } catch (error) {
            console.error('获取讨论统计失败:', error);
            throw error;
        }
    }

    // 检查用户是否可以发送消息
    static async canSendMessage(lectureId, userId) {
        try {
            // 检查用户是否已加入讲座
            const ParticipantModel = require('./participantModel');
            const isInLecture = await ParticipantModel.isUserInLecture(lectureId, userId);

            if (!isInLecture) {
                // 检查是否是讲座创建者
                const isCreator = await ParticipantModel.isLectureCreator(lectureId, userId);
                if (!isCreator) {
                    return { canSend: false, reason: '您需要先加入讲座才能参与讨论' };
                }
            }

            // 检查讲座状态
            const lectureQuery = `SELECT status FROM lectures WHERE id = ?`;
            const [rows] = await dbExecute(lectureQuery, [lectureId]);
            if (!rows || (Array.isArray(rows) && rows.length === 0)) {
                return { canSend: false, reason: '讲座不存在' };
            }
            // 兼容对象和数组两种情况
            const status = Array.isArray(rows) ? rows[0]?.status : rows.status;
            if (status !== 1) {
                return { canSend: false, reason: '只能在进行中的讲座参与讨论' };
            }

            // 检查发言频率（防止刷屏）
            const recentQuery = `
                SELECT COUNT(*) as count 
                FROM lecture_discussions 
                WHERE lecture_id = ? AND user_id = ? 
                AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)
            `;
            const [recent] = await dbExecute(recentQuery, [lectureId, userId]);
            const count = Array.isArray(recent) ? recent[0]?.count : recent.count;
            if (count >= 5) {
                return { canSend: false, reason: '发言过于频繁，请稍后再试' };
            }

            return { canSend: true };
        } catch (error) {
            console.error('检查发言权限失败:', error);
            throw error;
        }
    }

    // 获取最新消息ID（用于轮询）
    static async getLatestMessageId(lectureId) {
        try {
            const query = `SELECT MAX(id) as latest_id FROM lecture_discussions WHERE lecture_id = ?`;
            const [result] = await dbExecute(query, [lectureId]);
            return result[0].latest_id || 0;
        } catch (error) {
            console.error('获取最新消息ID失败:', error);
            throw error;
        }
    }

    // 获取用户在讨论中的点赞状态
    static async getUserLikeStatus(lectureId, userId) {
        try {
            const query = `
                SELECT dl.discussion_id 
                FROM discussion_likes dl
                JOIN lecture_discussions d ON dl.discussion_id = d.id
                WHERE d.lecture_id = ? AND dl.user_id = ?
            `;
            const likes = await dbExecute(query, [lectureId, userId]);
            if (!Array.isArray(likes)) return [];
            return likes.map(like => like.discussion_id);
        } catch (error) {
            console.error('获取用户点赞状态失败:', error);
            throw error;
        }
    }
}

module.exports = DiscussionModel;
