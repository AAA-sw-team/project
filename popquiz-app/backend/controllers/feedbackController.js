const FeedbackModel = require('../models/feedbackModel');
const ParticipantModel = require('../models/participantModel');

class FeedbackController {
    // 提交反馈
    static async submitFeedback(req, res) {
        try {
            const { lectureId } = req.params;
            const { feedbackType, feedbackMessage } = req.body;
            const userId = req.user.userId;

            // 验证反馈类型
            const validTypes = Object.keys(FeedbackModel.getFeedbackTypes());
            if (!validTypes.includes(feedbackType)) {
                return res.status(400).json({
                    success: false,
                    message: '无效的反馈类型'
                });
            }

            // 检查是否可以提交反馈
            const canSubmit = await FeedbackModel.canSubmitFeedback(lectureId, userId);
            if (!canSubmit.canSubmit) {
                return res.status(403).json({
                    success: false,
                    message: canSubmit.reason
                });
            }

            // 提交反馈
            const result = await FeedbackModel.submitFeedback(
                lectureId,
                userId,
                feedbackType,
                feedbackMessage
            );

            res.json({
                success: true,
                message: '反馈提交成功',
                data: {
                    feedbackId: result.feedbackId,
                    feedbackType: feedbackType,
                    feedbackTypeText: FeedbackModel.getFeedbackTypes()[feedbackType]
                }
            });

        } catch (error) {
            console.error('提交反馈失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器错误，请稍后重试'
            });
        }
    }

    // 获取讲座反馈列表（讲师用）
    static async getLectureFeedback(req, res) {
        try {
            const { lectureId } = req.params;
            const { page = 1, limit = 50 } = req.query;
            const userId = req.user.userId;

            // 验证讲师权限
            const hasPermission = await ParticipantModel.isLectureCreator(lectureId, userId);
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: '只有讲座创建者可以查看反馈'
                });
            }

            const result = await FeedbackModel.getLectureFeedback(
                lectureId,
                parseInt(page),
                parseInt(limit)
            );

            // 添加反馈类型文本描述
            const feedbackTypes = FeedbackModel.getFeedbackTypes();
            result.feedbacks = Array.isArray(result.feedbacks) ? result.feedbacks.map(feedback => ({
                ...feedback,
                feedbackTypeText: feedbackTypes[feedback.feedback_type]
            })) : [];

            res.json({
                success: true,
                message: '获取反馈列表成功',
                data: result
            });

        } catch (error) {
            console.error('获取讲座反馈失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器错误，请稍后重试'
            });
        }
    }

    // 获取讲座反馈统计（讲师用）
    static async getLectureFeedbackStats(req, res) {
        try {
            const { lectureId } = req.params;
            const userId = req.user.userId;

            // 验证讲师权限
            const hasPermission = await ParticipantModel.isLectureCreator(lectureId, userId);
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: '只有讲座创建者可以查看反馈统计'
                });
            }

            const result = await FeedbackModel.getLectureFeedbackStats(lectureId);

            // 添加反馈类型文本描述
            const feedbackTypes = FeedbackModel.getFeedbackTypes();
            result.stats = Array.isArray(result.stats) ? result.stats.map(stat => ({
                ...stat,
                feedbackTypeText: feedbackTypes[stat.feedback_type]
            })) : [];

            result.recentFeedback = Array.isArray(result.recentFeedback) ? result.recentFeedback.map(feedback => ({
                ...feedback,
                feedbackTypeText: feedbackTypes[feedback.feedback_type]
            })) : [];

            res.json({
                success: true,
                message: '获取反馈统计成功',
                data: result
            });

        } catch (error) {
            console.error('获取反馈统计失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器错误，请稍后重试'
            });
        }
    }

    // 获取用户反馈历史
    static async getUserFeedbackHistory(req, res) {
        try {
            const { lectureId } = req.params;
            const userId = req.user.userId;

            const history = await FeedbackModel.getUserFeedbackHistory(lectureId, userId);

            // 添加反馈类型文本描述
            const feedbackTypes = FeedbackModel.getFeedbackTypes();
            const historyWithText = history.map(feedback => ({
                ...feedback,
                feedbackTypeText: feedbackTypes[feedback.feedback_type]
            }));

            res.json({
                success: true,
                message: '获取反馈历史成功',
                data: {
                    history: historyWithText,
                    totalCount: history.length
                }
            });

        } catch (error) {
            console.error('获取用户反馈历史失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器错误，请稍后重试'
            });
        }
    }

    // 获取反馈类型列表
    static async getFeedbackTypes(req, res) {
        try {
            const feedbackTypes = FeedbackModel.getFeedbackTypes();

            res.json({
                success: true,
                message: '获取反馈类型成功',
                data: {
                    feedbackTypes: Object.entries(feedbackTypes).map(([key, value]) => ({
                        type: key,
                        text: value
                    }))
                }
            });

        } catch (error) {
            console.error('获取反馈类型失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器错误，请稍后重试'
            });
        }
    }

    // 实时反馈概览（讲师用，用于实时了解当前反馈情况）
    static async getRealtimeFeedbackOverview(req, res) {
        try {
            const { lectureId } = req.params;
            const userId = req.user.userId;

            // 验证讲师权限
            const hasPermission = await ParticipantModel.isLectureCreator(lectureId, userId);
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: '只有讲座创建者可以查看实时反馈'
                });
            }

            // 获取最近10分钟的反馈
            const recentQuery = `
                SELECT 
                    feedback_type,
                    COUNT(*) as count
                FROM lecture_feedback 
                WHERE lecture_id = ? 
                AND created_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)
                GROUP BY feedback_type
                ORDER BY count DESC
            `;

            const db = require('../models/db');
            const [recentStats] = await db.execute(recentQuery, [lectureId]);

            // 添加反馈类型文本描述
            const feedbackTypes = FeedbackModel.getFeedbackTypes();
            const recentStatsWithText = recentStats.map(stat => ({
                ...stat,
                feedbackTypeText: feedbackTypes[stat.feedback_type]
            }));

            // 获取最新的5条反馈
            const latestQuery = `
                SELECT 
                    lf.feedback_type,
                    lf.feedback_message,
                    lf.created_at,
                    u.username
                FROM lecture_feedback lf
                JOIN users u ON lf.user_id = u.id
                WHERE lf.lecture_id = ?
                ORDER BY lf.created_at DESC
                LIMIT 5
            `;
            const [latestFeedback] = await db.execute(latestQuery, [lectureId]);

            const latestWithText = latestFeedback.map(feedback => ({
                ...feedback,
                feedbackTypeText: feedbackTypes[feedback.feedback_type]
            }));

            res.json({
                success: true,
                message: '获取实时反馈概览成功',
                data: {
                    recentStats: recentStatsWithText,
                    latestFeedback: latestWithText,
                    timestamp: new Date()
                }
            });

        } catch (error) {
            console.error('获取实时反馈概览失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器错误，请稍后重试'
            });
        }
    }
}

module.exports = FeedbackController;
