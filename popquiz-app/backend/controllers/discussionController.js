const DiscussionModel = require('../models/discussionModel');
const ParticipantModel = require('../models/participantModel');

class DiscussionController {
    // 发送消息
    static async sendMessage(req, res) {
        try {
            const { lectureId } = req.params;
            const { message, messageType = 'text', parentId = null, isAnonymous = false } = req.body;
            const userId = req.user.userId;
            const userRole = req.user.role;

            // 验证消息内容
            if (!message || message.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '消息内容不能为空'
                });
            }

            if (message.length > 1000) {
                return res.status(400).json({
                    success: false,
                    message: '消息内容过长，请控制在1000字符以内'
                });
            }

            // 验证消息类型
            const validTypes = ['text', 'question', 'answer', 'announcement'];
            if (!validTypes.includes(messageType)) {
                return res.status(400).json({
                    success: false,
                    message: '无效的消息类型'
                });
            }

            // 组织者可直接发言，其它用户需原有权限
            if (userRole !== 'organizer') {
                const canSend = await DiscussionModel.canSendMessage(lectureId, userId);
                if (!canSend.canSend) {
                    return res.status(403).json({
                        success: false,
                        message: canSend.reason
                    });
                }
            }

            // 如果是回复消息，验证父消息是否存在
            if (parentId) {
                const db = require('../models/db');
                const [parentMsg] = await db.promise().query(
                    'SELECT id FROM lecture_discussions WHERE id = ? AND lecture_id = ?',
                    [parentId, lectureId]
                );
                if (parentMsg.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: '回复的消息不存在'
                    });
                }
            }

            // 发送消息
            const result = await DiscussionModel.sendMessage(
                lectureId,
                userId,
                message.trim(),
                messageType,
                parentId,
                isAnonymous
            );

            res.json({
                success: true,
                message: '消息发送成功',
                data: {
                    messageId: result.messageId,
                    messageType,
                    isAnonymous
                }
            });

        } catch (error) {
            console.error('发送消息失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器错误，请稍后重试'
            });
        }
    }

    // 获取讨论消息（用于轮询）
    static async getNewMessages(req, res) {
        try {
            const { lectureId } = req.params;
            const { lastMessageId = 0, limit = 20 } = req.query;
            const userId = req.user.userId;

            // 检查访问权限
            const canAccess = await DiscussionModel.canSendMessage(lectureId, userId);
            if (!canAccess.canSend && !await ParticipantModel.isLectureCreator(lectureId, userId)) {
                return res.status(403).json({
                    success: false,
                    message: '没有权限查看讨论'
                });
            }

            const messages = await DiscussionModel.getDiscussionMessages(
                lectureId,
                parseInt(lastMessageId),
                parseInt(limit)
            );

            // 获取用户的点赞状态
            const userLikes = await DiscussionModel.getUserLikeStatus(lectureId, userId);

            // 添加用户点赞状态
            const messagesWithLikeStatus = messages.map(message => ({
                ...message,
                isLikedByUser: userLikes.includes(message.id)
            }));

            res.json({
                success: true,
                message: '获取新消息成功',
                data: {
                    messages: messagesWithLikeStatus,
                    hasMore: messages.length === parseInt(limit)
                }
            });

        } catch (error) {
            console.error('获取新消息失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器错误，请稍后重试'
            });
        }
    }

    // 获取所有讨论消息（初始加载）
    static async getAllMessages(req, res) {
        try {
            const { lectureId } = req.params;
            const { page = 1, limit = 30 } = req.query;
            const userId = req.user.userId;
            const userRole = req.user.role;

            console.log('获取讨论消息 - 讲座ID:', lectureId, '用户ID:', userId, '页码:', page, '限制:', limit);

            // 检查访问权限
            if (userRole !== 'organizer') {
                const canAccess = await DiscussionModel.canSendMessage(lectureId, userId);
                console.log('用户发言权限检查结果:', canAccess);
                if (!canAccess.canSend && !await ParticipantModel.isLectureCreator(lectureId, userId)) {
                    console.log('用户无权限查看讨论');
                    return res.status(403).json({
                        success: false,
                        message: '没有权限查看讨论'
                    });
                }
            }

            const result = await DiscussionModel.getAllDiscussionMessages(
                lectureId,
                parseInt(page),
                parseInt(limit)
            );

            console.log('从数据库获取的讨论数据:', result);
            console.log('讨论消息数量:', result?.messages?.length || 0);

            // 获取用户的点赞状态
            const userLikes = await DiscussionModel.getUserLikeStatus(lectureId, userId);
            console.log('用户点赞状态:', userLikes);

            // 添加用户点赞状态
            result.messages = result.messages.map(message => ({
                ...message,
                isLikedByUser: userLikes.includes(message.id),
                replies: Array.isArray(message.replies) ? message.replies.map(reply => ({
                    ...reply,
                    isLikedByUser: userLikes.includes(reply.id)
                })) : []
            }));

            console.log('处理后的讨论数据:', result);

            res.json({
                success: true,
                message: '获取讨论消息成功',
                data: result
            });

        } catch (error) {
            console.error('获取讨论消息失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器错误，请稍后重试'
            });
        }
    }

    // 点赞/取消点赞
    static async toggleLike(req, res) {
        try {
            const { discussionId } = req.params;
            const userId = req.user.userId;

            const result = await DiscussionModel.toggleLike(discussionId, userId);

            res.json({
                success: true,
                message: result.message,
                data: {
                    action: result.action
                }
            });

        } catch (error) {
            console.error('切换点赞状态失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器错误，请稍后重试'
            });
        }
    }

    // 置顶/取消置顶（仅讲师）
    static async togglePin(req, res) {
        try {
            const { lectureId, discussionId } = req.params;
            const userId = req.user.userId;

            const result = await DiscussionModel.togglePin(discussionId, lectureId, userId);

            if (!result.success) {
                return res.status(403).json(result);
            }

            res.json({
                success: true,
                message: result.message,
                data: {
                    action: result.action
                }
            });

        } catch (error) {
            console.error('切换置顶状态失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器错误，请稍后重试'
            });
        }
    }

    // 删除消息
    static async deleteMessage(req, res) {
        try {
            const { lectureId, discussionId } = req.params;
            const userId = req.user.userId;
            const userRole = req.user.role;

            const result = await DiscussionModel.deleteMessage(discussionId, lectureId, userId, userRole);

            if (!result.success) {
                return res.status(403).json(result);
            }

            res.json({
                success: true,
                message: result.message
            });

        } catch (error) {
            console.error('删除消息失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器错误，请稍后重试'
            });
        }
    }

    // 获取讨论统计
    static async getDiscussionStats(req, res) {
        try {
            const { lectureId } = req.params;
            const userId = req.user.userId;

            // 验证讲师权限
            const hasPermission = await ParticipantModel.isLectureCreator(lectureId, userId);
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: '只有讲座创建者可以查看讨论统计'
                });
            }

            const stats = await DiscussionModel.getDiscussionStats(lectureId);

            res.json({
                success: true,
                message: '获取讨论统计成功',
                data: stats
            });

        } catch (error) {
            console.error('获取讨论统计失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器错误，请稍后重试'
            });
        }
    }

    // 获取最新消息ID（用于轮询检查）
    static async getLatestMessageId(req, res) {
        try {
            const { lectureId } = req.params;
            const userId = req.user.userId;

            // 检查访问权限
            const canAccess = await DiscussionModel.canSendMessage(lectureId, userId);
            if (!canAccess.canSend && !await ParticipantModel.isLectureCreator(lectureId, userId)) {
                return res.status(403).json({
                    success: false,
                    message: '没有权限查看讨论'
                });
            }

            const latestId = await DiscussionModel.getLatestMessageId(lectureId);

            res.json({
                success: true,
                message: '获取最新消息ID成功',
                data: {
                    latestMessageId: latestId
                }
            });

        } catch (error) {
            console.error('获取最新消息ID失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器错误，请稍后重试'
            });
        }
    }

    // 发送公告（仅讲师）
    static async sendAnnouncement(req, res) {
        try {
            const { lectureId } = req.params;
            const { message } = req.body;
            const userId = req.user.userId;

            // 验证讲师权限
            const hasPermission = await ParticipantModel.isLectureCreator(lectureId, userId);
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: '只有讲座创建者可以发送公告'
                });
            }

            // 验证消息内容
            if (!message || message.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '公告内容不能为空'
                });
            }

            // 发送公告（自动置顶）
            const result = await DiscussionModel.sendMessage(
                lectureId,
                userId,
                message.trim(),
                'announcement',
                null,
                false
            );

            // 自动置顶公告
            await DiscussionModel.togglePin(result.messageId, lectureId, userId);

            res.json({
                success: true,
                message: '公告发送成功',
                data: {
                    messageId: result.messageId
                }
            });

        } catch (error) {
            console.error('发送公告失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器错误，请稍后重试'
            });
        }
    }
}

module.exports = DiscussionController;
