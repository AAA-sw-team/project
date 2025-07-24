/*
 Navicat Premium Dump SQL

 Source Server         : dddd
 Source Server Type    : MySQL
 Source Server Version : 80038 (8.0.38)
 Source Host           : localhost:3306
 Source Schema         : popquiz

 Target Server Type    : MySQL
 Target Server Version : 80038 (8.0.38)
 File Encoding         : 65001

 Date: 24/07/2025 20:51:01
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for discussion_likes
-- ----------------------------
DROP TABLE IF EXISTS `discussion_likes`;
CREATE TABLE `discussion_likes`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `discussion_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_user_like`(`discussion_id` ASC, `user_id` ASC) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_discussion_likes`(`discussion_id` ASC) USING BTREE,
  CONSTRAINT `discussion_likes_ibfk_1` FOREIGN KEY (`discussion_id`) REFERENCES `lecture_discussions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `discussion_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of discussion_likes
-- ----------------------------

-- ----------------------------
-- Table structure for files
-- ----------------------------
DROP TABLE IF EXISTS `files`;
CREATE TABLE `files`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `lecture_id` int NOT NULL,
  `speaker_id` int NOT NULL,
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `filepath` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `filetype` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `uploaded_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_speaker_id`(`speaker_id` ASC) USING BTREE,
  INDEX `fk_lecture`(`lecture_id` ASC) USING BTREE,
  CONSTRAINT `files_ibfk_1` FOREIGN KEY (`lecture_id`) REFERENCES `lectures` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `files_ibfk_2` FOREIGN KEY (`speaker_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_lecture` FOREIGN KEY (`lecture_id`) REFERENCES `lectures` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of files
-- ----------------------------
INSERT INTO `files` VALUES (2, 12, 6, 'passage.txt', 'E:\\project-1\\popquiz-app\\uploads\\6-1753331708179-passage.txt', 'text/plain', '2025-07-24 12:35:08');
INSERT INTO `files` VALUES (3, 12, 6, 'passage.txt', 'E:\\project-1\\popquiz-app\\uploads\\6-1753335964856-passage.txt', 'text/plain', '2025-07-24 13:46:04');
INSERT INTO `files` VALUES (4, 12, 6, 'example.txt', 'E:\\project-1\\popquiz-app\\uploads\\6-1753336702798-example.txt', 'text/plain', '2025-07-24 13:58:22');
INSERT INTO `files` VALUES (5, 12, 6, 'example.txt', 'E:\\project-1\\popquiz-app\\uploads\\6-1753337181923-example.txt', 'text/plain', '2025-07-24 14:06:21');
INSERT INTO `files` VALUES (6, 12, 6, 'example.txt', 'E:\\project-1\\popquiz-app\\uploads\\6-1753337930648-example.txt', 'text/plain', '2025-07-24 14:18:50');
INSERT INTO `files` VALUES (7, 12, 6, 'example.txt', 'E:\\project-1\\popquiz-app\\uploads\\6-1753339176436-example.txt', 'text/plain', '2025-07-24 14:39:36');
INSERT INTO `files` VALUES (8, 4, 2, 'passage.txt', 'E:\\project-1\\popquiz-app\\uploads\\2-1753354075084-passage.txt', 'text/plain', '2025-07-24 18:47:55');

-- ----------------------------
-- Table structure for lecture_discussions
-- ----------------------------
DROP TABLE IF EXISTS `lecture_discussions`;
CREATE TABLE `lecture_discussions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `lecture_id` int NOT NULL,
  `user_id` int NOT NULL,
  `parent_id` int NULL DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `message_type` enum('text','question','answer','announcement') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'text',
  `is_pinned` tinyint(1) NULL DEFAULT 0,
  `is_anonymous` tinyint(1) NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_lecture_discussions`(`lecture_id` ASC, `created_at` ASC) USING BTREE,
  INDEX `idx_user_discussions`(`user_id` ASC, `created_at` ASC) USING BTREE,
  INDEX `idx_parent_discussions`(`parent_id` ASC) USING BTREE,
  CONSTRAINT `lecture_discussions_ibfk_1` FOREIGN KEY (`lecture_id`) REFERENCES `lectures` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `lecture_discussions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `lecture_discussions_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `lecture_discussions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of lecture_discussions
-- ----------------------------

-- ----------------------------
-- Table structure for lecture_feedback
-- ----------------------------
DROP TABLE IF EXISTS `lecture_feedback`;
CREATE TABLE `lecture_feedback`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `lecture_id` int NOT NULL,
  `user_id` int NOT NULL,
  `feedback_type` enum('too_fast','too_slow','too_hard','too_easy','unclear','good','need_repeat','volume_low','volume_high','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `feedback_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_lecture_feedback`(`lecture_id` ASC, `created_at` ASC) USING BTREE,
  INDEX `idx_user_feedback`(`user_id` ASC, `created_at` ASC) USING BTREE,
  CONSTRAINT `lecture_feedback_ibfk_1` FOREIGN KEY (`lecture_id`) REFERENCES `lectures` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `lecture_feedback_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of lecture_feedback
-- ----------------------------

-- ----------------------------
-- Table structure for lecture_participants
-- ----------------------------
DROP TABLE IF EXISTS `lecture_participants`;
CREATE TABLE `lecture_participants`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `lecture_id` int NOT NULL,
  `user_id` int NOT NULL,
  `joined_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `left_at` datetime NULL DEFAULT NULL,
  `status` enum('joined','left') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'joined',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_lecture_user`(`lecture_id` ASC, `user_id` ASC) USING BTREE,
  INDEX `idx_lecture_id`(`lecture_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_participant_lecture` FOREIGN KEY (`lecture_id`) REFERENCES `lectures` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_participant_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of lecture_participants
-- ----------------------------
INSERT INTO `lecture_participants` VALUES (1, 1, 1, '2025-01-20 10:00:00', NULL, 'joined');

-- ----------------------------
-- Table structure for lectures
-- ----------------------------
DROP TABLE IF EXISTS `lectures`;
CREATE TABLE `lectures`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `speaker_id` int NOT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `status` tinyint(1) NULL DEFAULT 0,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `file_ids` json NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `speaker_id`(`speaker_id` ASC) USING BTREE,
  CONSTRAINT `lectures_ibfk_1` FOREIGN KEY (`speaker_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of lectures
-- ----------------------------
INSERT INTO `lectures` VALUES (1, 'AI时代的未来', '关于人工智能的发展趋势和应用', 2, '2025-07-15 18:05:08', 1, NULL, NULL);
INSERT INTO `lectures` VALUES (2, '测试讲座', '测试上传文件，生成题目', 2, '2025-07-20 20:19:20', 0, NULL, NULL);
INSERT INTO `lectures` VALUES (3, '重新测试', '好烦好烦,不想测试！！！', 2, '2025-07-22 17:00:57', 0, NULL, NULL);
INSERT INTO `lectures` VALUES (4, '重新测试', '好烦好烦,不想测试！！！', 2, '2025-07-22 17:02:01', 1, '杜博妍', '[\"8\"]');
INSERT INTO `lectures` VALUES (5, '重新测试', '好烦好烦,不想测试！！！', 2, '2025-07-22 17:02:06', 0, NULL, NULL);
INSERT INTO `lectures` VALUES (6, '好累怎么办', '写代码写得眼睛要瞎了', 6, '2025-07-23 22:51:37', 0, 'yyyy', NULL);
INSERT INTO `lectures` VALUES (7, '好累', '不想写代码', 6, '2025-07-23 23:20:55', 0, 'yyyy', NULL);
INSERT INTO `lectures` VALUES (8, '1111', '1111', 6, '2025-07-23 23:43:09', 0, 'yyyy', NULL);
INSERT INTO `lectures` VALUES (9, '111', '1111', 6, '2025-07-24 09:30:15', 0, 'yyyy', NULL);
INSERT INTO `lectures` VALUES (10, '11111', '1111', 6, '2025-07-24 09:30:23', 0, 'yyyy', NULL);
INSERT INTO `lectures` VALUES (11, '11', '1111', 6, '2025-07-24 09:30:33', 0, 'yyyy', NULL);
INSERT INTO `lectures` VALUES (12, '222', '222', 6, '2025-07-24 09:31:12', 1, 'yyyy', '[\"2\", \"3\", \"4\", \"5\", \"6\", \"7\"]');
INSERT INTO `lectures` VALUES (13, 'vbbunjn', '222', 6, '2025-07-24 09:31:31', 2, 'yyyy', NULL);

-- ----------------------------
-- Table structure for quiz_answers
-- ----------------------------
DROP TABLE IF EXISTS `quiz_answers`;
CREATE TABLE `quiz_answers`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `quiz_id` int NOT NULL,
  `selected_option` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `is_correct` tinyint(1) NULL DEFAULT NULL,
  `answered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `quiz_id`(`quiz_id` ASC) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `quiz_answers_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `quiz_answers_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 22 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of quiz_answers
-- ----------------------------
INSERT INTO `quiz_answers` VALUES (1, 1, 1, 'C', 1, '2025-07-16 18:33:12');
INSERT INTO `quiz_answers` VALUES (2, 1, 1, 'C', 1, '2025-01-20 10:30:00');
INSERT INTO `quiz_answers` VALUES (3, 1, 2, 'D', 1, '2025-01-20 10:30:00');
INSERT INTO `quiz_answers` VALUES (4, 1, 3, 'C', 1, '2025-01-20 10:30:00');
INSERT INTO `quiz_answers` VALUES (5, 1, 4, 'A', 0, '2025-01-20 10:30:00');
INSERT INTO `quiz_answers` VALUES (6, 1, 5, 'B', 0, '2025-01-20 10:30:00');
INSERT INTO `quiz_answers` VALUES (7, 1, 1, 'C', 1, '2025-01-20 10:30:00');
INSERT INTO `quiz_answers` VALUES (8, 1, 2, 'D', 1, '2025-01-20 10:30:00');
INSERT INTO `quiz_answers` VALUES (9, 1, 3, 'C', 1, '2025-01-20 10:30:00');
INSERT INTO `quiz_answers` VALUES (10, 1, 4, 'A', 0, '2025-01-20 10:30:00');
INSERT INTO `quiz_answers` VALUES (11, 1, 5, 'B', 0, '2025-01-20 10:30:00');
INSERT INTO `quiz_answers` VALUES (12, 1, 1, 'C', 1, '2025-01-20 10:30:00');
INSERT INTO `quiz_answers` VALUES (13, 1, 2, 'D', 1, '2025-01-20 10:30:00');
INSERT INTO `quiz_answers` VALUES (14, 1, 3, 'C', 1, '2025-01-20 10:30:00');
INSERT INTO `quiz_answers` VALUES (15, 1, 4, 'A', 0, '2025-01-20 10:30:00');
INSERT INTO `quiz_answers` VALUES (16, 1, 5, 'B', 0, '2025-01-20 10:30:00');
INSERT INTO `quiz_answers` VALUES (17, 1, 1, 'C', 1, '2025-01-20 10:30:00');
INSERT INTO `quiz_answers` VALUES (18, 1, 2, 'D', 1, '2025-01-20 10:30:00');
INSERT INTO `quiz_answers` VALUES (19, 1, 3, 'C', 1, '2025-01-20 10:30:00');
INSERT INTO `quiz_answers` VALUES (20, 1, 4, 'A', 0, '2025-01-20 10:30:00');
INSERT INTO `quiz_answers` VALUES (21, 1, 5, 'B', 0, '2025-01-20 10:30:00');

-- ----------------------------
-- Table structure for quiz_batches
-- ----------------------------
DROP TABLE IF EXISTS `quiz_batches`;
CREATE TABLE `quiz_batches`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `lecture_id` int NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT NULL,
  `file_ids` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `media_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `quiz_count` int NULL DEFAULT NULL,
  `published` tinyint NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `lecture_id`(`lecture_id` ASC) USING BTREE,
  CONSTRAINT `quiz_batches_ibfk_1` FOREIGN KEY (`lecture_id`) REFERENCES `lectures` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of quiz_batches
-- ----------------------------

-- ----------------------------
-- Table structure for quizzes
-- ----------------------------
DROP TABLE IF EXISTS `quizzes`;
CREATE TABLE `quizzes`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `lecture_id` int NOT NULL,
  `question` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `option_a` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `option_b` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `option_c` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `option_d` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `correct_option` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `published` tinyint(1) NULL DEFAULT NULL COMMENT '0未发布 1已发布 null新生成',
  `batch_id` int NULL DEFAULT NULL,
  `group_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `source_file_ids` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '生成该题目的文件id数组（JSON）',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_quiz_lecture`(`lecture_id` ASC) USING BTREE,
  INDEX `batch_id`(`batch_id` ASC) USING BTREE,
  CONSTRAINT `fk_quiz_lecture` FOREIGN KEY (`lecture_id`) REFERENCES `lectures` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`lecture_id`) REFERENCES `lectures` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `quizzes_ibfk_2` FOREIGN KEY (`batch_id`) REFERENCES `quiz_batches` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 58 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of quizzes
-- ----------------------------
INSERT INTO `quizzes` VALUES (1, 1, '人工智能的核心是什么？', '数据分析', '人脸识别', '模仿人类思维', '控制硬件', 'C', '2025-07-15 20:01:54', NULL, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (2, 1, '以下哪个不是人工智能的应用？', '语音识别', '自动驾驶', '翻译系统', '电饭煲加热', 'D', '2025-07-15 20:01:54', NULL, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (3, 1, '人工智能的核心是什么？', '数据分析', '人脸识别', '模仿人类思维', '控制硬件', 'C', '2025-07-16 17:55:11', NULL, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (4, 1, '以下哪个不是人工智能的应用？', '语音识别', '自动驾驶', '翻译系统', '电饭煲加热', 'D', '2025-07-16 17:55:11', NULL, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (5, 1, 'AI 是什么的缩写？', 'Artificial Intelligence', 'Animal Intelligence', 'Auto Interface', 'Advanced Input', 'A', '2025-07-19 17:02:38', NULL, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (6, 1, 'AI 是什么的缩写？', 'Artificial Intelligence', 'Animal Intelligence', 'Auto Interface', 'Advanced Input', 'A', '2025-07-19 21:28:52', NULL, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (7, 1, '机器学习属于哪种技术？', '硬件技术', '软件技术', '人工智能', '网络技术', 'C', '2025-07-19 21:28:52', NULL, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (8, 1, 'AI 是什么的缩写？', 'Artificial Intelligence', 'Animal Intelligence', 'Auto Interface', 'Advanced Input', 'A', '2025-07-19 21:38:25', NULL, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (9, 1, '机器学习属于哪种技术？', '硬件技术', '软件技术', '人工智能', '网络技术', 'C', '2025-07-19 21:38:25', NULL, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (10, 1, 'AI 是什么的缩写？', 'Artificial Intelligence', 'Animal Intelligence', 'Auto Interface', 'Advanced Input', 'A', '2025-07-19 21:40:02', NULL, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (11, 1, '机器学习属于哪种技术？', '硬件技术', '软件技术', '人工智能', '网络技术', 'C', '2025-07-19 21:40:02', NULL, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (12, 2, '职场沟通的第一步是明确任务的重点。', '不对', '正确', '非常正确', '完全正确', '', '2025-07-20 22:31:39', NULL, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (13, 2, '在职场中，主动倾听对方的观点可以帮助建立良好的沟通关系。', '是的，但不太重要', '完全正确', '不是必须的，但有助于理解', '不推荐', '', '2025-07-20 22:31:39', NULL, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (14, 2, '在工作中，保持角色转换的能力非常重要，以便更好地应对不同环境。', '是的，但不够实用', '完全正确', '需要进一步练习才能掌握', '不重要', '', '2025-07-20 22:31:39', NULL, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (15, 2, '当同事对你的方案提出质疑时，可以用‘是的，而且’来表达你的支持。', '正确', '不正确', '是正确的，但不够具体', '完全错误', '', '2025-07-20 22:31:39', NULL, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (16, 2, '职场沟通中遇到冲突时，最好的方法是先站在对方的角度思考问题。', '是的，但不太有效', '完全正确', '这个策略不实用', '不建议', '', '2025-07-20 22:31:39', NULL, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (17, 12, '沟通前如何捕捉隐性信息？', '直接开口问对方', '先了解对方需求', '咨询同事或领导', '确认具体要求', 'B', '2025-07-24 12:37:42', NULL, NULL, '678f2ea1-b956-4a76-9dd1-35f215d1f547', '[2]');
INSERT INTO `quizzes` VALUES (18, 12, '在角色转换时，如何表达更清晰？', '只给出建议', '肯定并提出疑问', '直接给出答案', '避免直接反驳对方', 'B', '2025-07-24 12:37:42', NULL, NULL, '678f2ea1-b956-4a76-9dd1-35f215d1f547', '[2]');
INSERT INTO `quizzes` VALUES (19, 12, '如何使用‘3W1H’方法解决任务传达的问题？', '确认任务内容', '明确任务目的', '详细列出步骤', '提供详细的反馈信息', 'B', '2025-07-24 12:37:42', NULL, NULL, '678f2ea1-b956-4a76-9dd1-35f215d1f547', '[2]');
INSERT INTO `quizzes` VALUES (20, 12, '在指导式对话中，如何避免直接反驳？', '立即反驳对方', '以中立态度表达意见', '直接给出答案', '提供建议和支持', 'B', '2025-07-24 12:37:42', NULL, NULL, '678f2ea1-b956-4a76-9dd1-35f215d1f547', '[2]');
INSERT INTO `quizzes` VALUES (21, 12, '在冲突中如何更好地沟通？', '立即反驳对方', '以中立态度表达意见', '避免直接反驳对方', '提供建议和支持', 'B', '2025-07-24 12:37:42', NULL, NULL, '678f2ea1-b956-4a76-9dd1-35f215d1f547', '[2]');
INSERT INTO `quizzes` VALUES (27, 12, 'We come to the park today.', 'we are coming', 'we will be coming', 'we are not coming', 'we are coming tomorrow', 'D', '2025-07-24 14:08:35', NULL, NULL, '2fcb373d-371f-40fa-b400-7ea0dcbdc567', '[5]');
INSERT INTO `quizzes` VALUES (28, 12, 'We have come to the park.', 'we are coming', 'we are going', 'we are coming to', 'we are here', 'A', '2025-07-24 14:08:35', NULL, NULL, '2fcb373d-371f-40fa-b400-7ea0dcbdc567', '[5]');
INSERT INTO `quizzes` VALUES (29, 12, 'The speaker is in the room now.', 'the speaker is not in the room now', 'the speaker is sitting in the room', 'the speaker is coming to speak', 'the speaker is speaking on stage', 'C', '2025-07-24 14:08:35', NULL, NULL, '2fcb373d-371f-40fa-b400-7ea0dcbdc567', '[5]');
INSERT INTO `quizzes` VALUES (30, 12, 'The activity has started now.', 'the activity is not starting now', 'the activity will start now', 'the activity has just finished', 'the activity is ongoing', 'B', '2025-07-24 14:08:35', NULL, NULL, '2fcb373d-371f-40fa-b400-7ea0dcbdc567', '[5]');
INSERT INTO `quizzes` VALUES (31, 12, 'We have been visiting the museum to see the exhibits.', 'we are not having fun at the museum', 'we have visited the museum recently', 'we are looking forward to seeing the exhibits', 'we have gone on tours', 'C', '2025-07-24 14:08:35', NULL, NULL, '2fcb373d-371f-40fa-b400-7ea0dcbdc567', '[5]');
INSERT INTO `quizzes` VALUES (32, 12, '在第一轮修改中，您对哪些章节的内容进行了深入理解？（请从以下知识点中选择最符合的选项）', '第一章：基础知识和基础概念', '第二章：重点内容与应用案例', '第三章：实践技能与创新思维', '第四章：综合评估与总结方法', '', '2025-07-24 14:09:12', NULL, NULL, '5225484f-eeb5-446b-abad-10e4d35119d5', '[5]');
INSERT INTO `quizzes` VALUES (33, 12, '在第一轮修改中，您是否能够清晰地将所学知识应用于实际操作？（请选择正确描述能力的选项）', '只有通过实践才能完全掌握内容', '理论知识可以直接应用到各种情境中', '仅靠记忆和简单理解即可掌握内容', '需要深入理解和练习才能掌握', '', '2025-07-24 14:09:12', NULL, NULL, '5225484f-eeb5-446b-abad-10e4d35119d5', '[5]');
INSERT INTO `quizzes` VALUES (34, 12, '在第一轮修改中，您是否能够准确地总结并概括所学内容？（请选择正确描述总结能力的选项）', '仅靠记忆和简单理解即可完成总结', '必须结合具体例子和情境才能完成总结', '可以通过反复练习来提高总结能力', '通过教师讲解和集体讨论来完成', '', '2025-07-24 14:09:12', NULL, NULL, '5225484f-eeb5-446b-abad-10e4d35119d5', '[5]');
INSERT INTO `quizzes` VALUES (35, 12, '在第一轮修改中，您是否能够有效处理遇到的疑问或挑战？（请选择正确描述解决问题能力的选项）', '遇到问题时需要快速回顾课本内容', '遇到问题时需要深入思考和分析', '遇到问题时需要立即给出答案并完成任务', '遇到问题时需要反复查找资料或咨询他人', '', '2025-07-24 14:09:12', NULL, NULL, '5225484f-eeb5-446b-abad-10e4d35119d5', '[5]');
INSERT INTO `quizzes` VALUES (36, 12, '在第一轮修改中，您是否能够准确地表达自己的理解和体会？（请选择正确描述表达能力的选项）', '表达需要依赖于记忆和简单理解', '表达需要结合具体例子和情境才能完成', NULL, NULL, '', '2025-07-24 14:09:12', NULL, NULL, '5225484f-eeb5-446b-abad-10e4d35119d5', '[5]');
INSERT INTO `quizzes` VALUES (37, 12, '在第一轮修改中，您是否能够准确地识别并处理常见的错误或不足？（请选择正确描述反思能力的选项）', '需要通过多次实践来逐步纠正', '只需要一次尝试就可以完全掌握', NULL, NULL, '', '2025-07-24 14:09:12', NULL, NULL, '5225484f-eeb5-446b-abad-10e4d35119d5', '[5]');
INSERT INTO `quizzes` VALUES (38, 12, '在编程语言中，什么是最基本的数据类型？', 'string', 'int', 'float', 'bool', 'B', '2025-07-24 14:09:13', NULL, NULL, '002668bb-dce9-45ab-aab4-5bdec2670a6f', '[5]');
INSERT INTO `quizzes` VALUES (39, 12, '如何判断一个命题是真还是假？', '不正确，因为不能确定真假性', '正确的方法是通过逻辑推理得出结论', '可能只是陈述事实，不一定有真假', '正确答案取决于具体情况和判断依据', 'B', '2025-07-24 14:09:13', NULL, NULL, '002668bb-dce9-45ab-aab4-5bdec2670a6f', '[5]');
INSERT INTO `quizzes` VALUES (40, 12, '你在日常生活中，如何应用几何知识解决实际问题？', '无法应用几何知识，因为这些领域不涉及图形或形状', '例如测量房间的面积或计算家具摆放位置', '无法应用几何知识，因为它们通常与数字和数值有关', '正确答案是能够通过几何方法解决问题，如测量物体长度或角度', 'D', '2025-07-24 14:09:13', NULL, NULL, '002668bb-dce9-45ab-aab4-5bdec2670a6f', '[5]');
INSERT INTO `quizzes` VALUES (41, 12, '在编程中，如何编写简单的变量赋值语句？', 'var x = 5;', 'x = 5；y = \'hello\'', 'str x = 5；int y = 6', 'false', 'A', '2025-07-24 14:09:13', NULL, NULL, '002668bb-dce9-45ab-aab4-5bdec2670a6f', '[5]');
INSERT INTO `quizzes` VALUES (42, 12, '在演讲中，你如何组织内容以使逻辑更清晰？', '使用详尽的步骤和解释', '使用大量例子来支持观点', '使用简洁的语言表达复杂概念', '正确答案是无法确定', 'A', '2025-07-24 14:09:13', NULL, NULL, '002668bb-dce9-45ab-aab4-5bdec2670a6f', '[5]');
INSERT INTO `quizzes` VALUES (48, 12, '小林在做报告时，遇到了信息不对的问题，主要出现在哪些方面？', '必须明确任务的重点', '需要主动去捕捉领导的隐性要求', '必须理解团队内部的需求', '必须按照流程进行操作', 'B', '2025-07-24 14:49:54', 1, NULL, 'c6a48709-87df-4da9-bc89-61a33ea4ccf2', '[2,7]');
INSERT INTO `quizzes` VALUES (49, 12, '职场沟通中，哪些策略能够有效提升效率？', '直接与领导沟通', '通过反馈式回应保持协作性', '主动提出解决方案以获得认可', '定期进行内部会议讨论', 'A', '2025-07-24 14:49:54', 1, NULL, 'c6a48709-87df-4da9-bc89-61a33ea4ccf2', '[2,7]');
INSERT INTO `quizzes` VALUES (50, 12, '当同事提出质疑时，如何处理冲突？', '立即反驳或直接批评', '用“是的”表达认可和支持', '坚持自己的观点并提出方案', '试图改变对方的看法', 'B', '2025-07-24 14:49:54', 1, NULL, 'c6a48709-87df-4da9-bc89-61a33ea4ccf2', '[2,7]');
INSERT INTO `quizzes` VALUES (51, 12, '沟通中的目标对齐问题，如何解决？', '必须明确自己的任务重点', '需要理解领导的隐性要求', '必须与同事保持一致', '可能不需要特别关注', 'A', '2025-07-24 14:49:54', 1, NULL, 'c6a48709-87df-4da9-bc89-61a33ea4ccf2', '[2,7]');
INSERT INTO `quizzes` VALUES (52, 12, '在面对冲突时，如何提升沟通效果？', '直接提出解决方案以获得认可', '通过反馈式回应保持协作性', '定期与领导沟通解决问题', '只能通过内部会议解决', 'C', '2025-07-24 14:49:54', 1, NULL, 'c6a48709-87df-4da9-bc89-61a33ea4ccf2', '[2,7]');
INSERT INTO `quizzes` VALUES (53, 4, '职场沟通中如何准确理解对方的需求是关键。', '你可能需要先确认自己的具体需求', '你可能需要先明确对方的目标', '你可能需要先了解对方的习惯', '你可能需要先观察对方的表情和行为', 'A', '2025-07-24 18:48:19', 1, NULL, '83a75717-be5d-4679-a4bd-aebcb8e30205', '[8]');
INSERT INTO `quizzes` VALUES (54, 4, '在职场沟通中，主动提出意见比被动接受更容易达成共识。', '有时候被动接受反而更直接', '有时候主动提出不如被动接受', '有时候被动接受不如主动提出', '主动提出和被动接受都有其优缺点', 'B', '2025-07-24 18:48:19', 1, NULL, '83a75717-be5d-4679-a4bd-aebcb8e30205', '[8]');
INSERT INTO `quizzes` VALUES (55, 4, '3W1H沟通法可以有效帮助你在工作中明确任务的做什么、为什么要做、何时做。', '你可以用这个方法来完成你的工作', '你可以用这个方法来记录你的工作', '你可以用这个方法来解释你的思路', '你可以用这个方法来解决冲突', 'A', '2025-07-24 18:48:19', 1, NULL, '83a75717-be5d-4679-a4bd-aebcb8e30205', '[8]');
INSERT INTO `quizzes` VALUES (56, 4, '当同事提出质疑时，如何礼貌地表达自己的意见以避免冲突。', '你可能需要先反驳同事的论点', '你可能需要先表达你的立场', '你可能需要直接回应同事的观点', '你可能不需要立即回应，而是可以等待他解答', 'B', '2025-07-24 18:48:19', 1, NULL, '83a75717-be5d-4679-a4bd-aebcb8e30205', '[8]');
INSERT INTO `quizzes` VALUES (57, 4, '从‘早上好’开始沟通练习可以逐渐积累属于你的沟通技巧。', '你可能需要先尝试直接开口', '你可能需要先观察对方的表情和回应', '你可能需要先确认自己的身份', '你可能不需要立即参与对话，而是可以观察对方', 'D', '2025-07-24 18:48:19', 1, NULL, '83a75717-be5d-4679-a4bd-aebcb8e30205', '[8]');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `role` enum('listener','speaker','organizer') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'listener',
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'test02', '$2b$10$Sk3uXbFIt.H37ak.QCYa9Ob4DCARPXvqB43O15q5Y1ZHv0A/dxJv6', 'listener', '新手用户', '2025-07-14 20:49:33');
INSERT INTO `users` VALUES (2, 'test01', '$2b$10$JpGbUjMXBZrhU2ImgnC55OivN0Syv.3E9h5WihWgIb91jVTFSgxK6', 'speaker', 'AI讲师小白', '2025-07-14 21:13:15');
INSERT INTO `users` VALUES (6, 'yyyy', '$2b$10$I.JHzNYS9rSdk/JeiNy9n.oHd/bI4SXSZO6kgFmFKbVWyOj/gr8rW', 'speaker', 'yyyy', '2025-07-23 22:17:30');

SET FOREIGN_KEY_CHECKS = 1;
