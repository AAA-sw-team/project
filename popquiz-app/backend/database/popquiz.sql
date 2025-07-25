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

 Date: 25/07/2025 20:08:11
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
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

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
INSERT INTO `files` VALUES (9, 1, 2, 'passage.txt', 'E:\\project-1\\popquiz-app\\uploads\\2-1753435318484-passage.txt', 'text/plain', '2025-07-25 17:21:58');

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
  `last_seen` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_lecture_user`(`lecture_id` ASC, `user_id` ASC) USING BTREE,
  INDEX `idx_lecture_id`(`lecture_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_participant_lecture` FOREIGN KEY (`lecture_id`) REFERENCES `lectures` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_participant_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of lecture_participants
-- ----------------------------
INSERT INTO `lecture_participants` VALUES (1, 1, 1, '2025-07-25 12:39:36', NULL, 'joined', '2025-07-25 20:07:23');

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
INSERT INTO `lectures` VALUES (1, 'AI时代的未来', '关于人工智能的发展趋势和应用', 2, '2025-07-15 18:05:08', 1, NULL, '[\"9\"]');
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
  `user_id` int NOT NULL COMMENT '用户ID',
  `quiz_id` int NOT NULL COMMENT '题目ID',
  `lecture_id` int NOT NULL COMMENT '讲座ID（冗余字段，便于查询）',
  `user_answer` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户答案（完整答案内容）',
  `selected_option` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '选择的选项（A/B/C/D）',
  `correct_answer` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '正确答案（完整答案内容）',
  `correct_option` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '正确选项（A/B/C/D）',
  `is_correct` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否正确（0-错误，1-正确）',
  `answer_time_ms` int NULL DEFAULT NULL COMMENT '答题用时（毫秒）',
  `submit_count` int NOT NULL DEFAULT 1 COMMENT '提交次数（防止重复提交）',
  `group_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '题目组ID',
  `answered_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '答题时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_user_quiz`(`user_id` ASC, `quiz_id` ASC) USING BTREE COMMENT '防止同一用户对同一题目重复答题',
  INDEX `idx_user_lecture`(`user_id` ASC, `lecture_id` ASC) USING BTREE COMMENT '用户讲座答题记录索引',
  INDEX `idx_quiz_stats`(`quiz_id` ASC, `is_correct` ASC) USING BTREE COMMENT '题目统计索引',
  INDEX `idx_lecture_stats`(`lecture_id` ASC, `answered_at` ASC) USING BTREE COMMENT '讲座答题统计索引',
  INDEX `idx_group_stats`(`group_id` ASC, `lecture_id` ASC) USING BTREE COMMENT '题目组统计索引',
  CONSTRAINT `fk_quiz_answers_lecture` FOREIGN KEY (`lecture_id`) REFERENCES `lectures` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_quiz_answers_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_quiz_answers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户答题记录表 - 存储用户对题目的答案及统计信息' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of quiz_answers
-- ----------------------------
INSERT INTO `quiz_answers` VALUES (4, 1, 1, 1, '数据分析', 'A', '模仿人类思维', 'C', 0, 2, 1, '', '2025-07-25 17:49:20', '2025-07-25 17:49:20');
INSERT INTO `quiz_answers` VALUES (5, 1, 2, 1, '翻译系统', 'C', '电饭煲加热', 'D', 0, 2, 1, '', '2025-07-25 17:55:33', '2025-07-25 17:55:33');
INSERT INTO `quiz_answers` VALUES (6, 1, 3, 1, '模仿人类思维', 'C', '模仿人类思维', 'C', 1, 1, 1, '', '2025-07-25 17:57:36', '2025-07-25 17:57:36');
INSERT INTO `quiz_answers` VALUES (7, 1, 4, 1, '电饭煲加热', 'D', '电饭煲加热', 'D', 1, 1, 1, '', '2025-07-25 17:57:43', '2025-07-25 17:57:43');
INSERT INTO `quiz_answers` VALUES (8, 1, 5, 1, 'Artificial Intelligence', 'A', 'Artificial Intelligence', 'A', 1, 1, 1, '', '2025-07-25 17:57:51', '2025-07-25 17:57:51');
INSERT INTO `quiz_answers` VALUES (9, 1, 58, 1, '信息传递出现重复或者遗漏。', 'C', '你不知道自己有什么潜在的需求或挑战。', 'B', 0, 1, 1, '1', '2025-07-25 17:58:06', '2025-07-25 17:58:06');
INSERT INTO `quiz_answers` VALUES (10, 1, 59, 1, '你将同事的角色从普通员工调整为决策者。', 'C', '你在工作中通过对话解决内部矛盾。', 'B', 0, 1, 1, '1', '2025-07-25 17:58:18', '2025-07-25 17:58:18');
INSERT INTO `quiz_answers` VALUES (11, 1, 60, 1, '列出所有可能影响沟通效果的因素。', 'B', '确认任务内容是否明确。', 'A', 0, 1, 1, '1', '2025-07-25 18:03:16', '2025-07-25 18:03:16');
INSERT INTO `quiz_answers` VALUES (12, 1, 61, 1, '你向对方简单地重复自己的观点。', 'B', '你只回复对方的直接回答，并提出新的问题。', 'C', 0, 1, 1, '1', '2025-07-25 18:03:31', '2025-07-25 18:03:31');
INSERT INTO `quiz_answers` VALUES (13, 1, 62, 1, '你主动承担与领导合作的重要职责。', 'B', '你主动承担与领导合作的重要职责。', 'B', 1, 1, 1, '1', '2025-07-25 18:03:42', '2025-07-25 18:03:42');

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
) ENGINE = InnoDB AUTO_INCREMENT = 63 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of quizzes
-- ----------------------------
INSERT INTO `quizzes` VALUES (1, 1, '人工智能的核心是什么？', '数据分析', '人脸识别', '模仿人类思维', '控制硬件', 'C', '2025-07-15 20:01:54', 1, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (2, 1, '以下哪个不是人工智能的应用？', '语音识别', '自动驾驶', '翻译系统', '电饭煲加热', 'D', '2025-07-15 20:01:54', 1, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (3, 1, '人工智能的核心是什么？', '数据分析', '人脸识别', '模仿人类思维', '控制硬件', 'C', '2025-07-16 17:55:11', 1, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (4, 1, '以下哪个不是人工智能的应用？', '语音识别', '自动驾驶', '翻译系统', '电饭煲加热', 'D', '2025-07-16 17:55:11', 1, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (5, 1, 'AI 是什么的缩写？', 'Artificial Intelligence', 'Animal Intelligence', 'Auto Interface', 'Advanced Input', 'A', '2025-07-19 17:02:38', 1, NULL, '', NULL);
INSERT INTO `quizzes` VALUES (58, 1, '在职场沟通中，信息差指的是哪些方面呢？', '对方没有完全理解公司潜规则。', '你不知道自己有什么潜在的需求或挑战。', '信息传递出现重复或者遗漏。', '其他选项不正确。', 'B', '2025-07-25 17:57:00', 1, NULL, '1', '[9]');
INSERT INTO `quizzes` VALUES (59, 1, '在职场沟通中，角色转换指的是什么？', '你直接向领导汇报工作。', '你在工作中通过对话解决内部矛盾。', '你将同事的角色从普通员工调整为决策者。', '其他选项不正确。', 'B', '2025-07-25 17:57:00', 1, NULL, '1', '[9]');
INSERT INTO `quizzes` VALUES (60, 1, '在职场沟通中，3W1H（即“What、Why、When、How”）的含义是怎样的？', '确认任务内容是否明确。', '列出所有可能影响沟通效果的因素。', '确保每位员工都有足够的准备时间处理任务。', '其他选项不正确。', 'A', '2025-07-25 17:57:00', 1, NULL, '1', '[9]');
INSERT INTO `quizzes` VALUES (61, 1, '在职场沟通中，反馈式回应指的是什么样的表达方式？', '你没有及时回应对方的问题。', '你向对方简单地重复自己的观点。', '你只回复对方的直接回答，并提出新的问题。', '其他选项不正确.', 'C', '2025-07-25 17:57:00', 1, NULL, '1', '[9]');
INSERT INTO `quizzes` VALUES (62, 1, '在职场沟通中，向上管理指的是什么？', '你的工作重点不突出。', '你主动承担与领导合作的重要职责。', '你在工作中注重与同事的关系而非领导关系。', '其他选项不正确.', 'B', '2025-07-25 17:57:00', 1, NULL, '1', '[9]');

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

-- ----------------------------
-- View structure for lecture_quiz_stats
-- ----------------------------
DROP VIEW IF EXISTS `lecture_quiz_stats`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `lecture_quiz_stats` AS select `qa`.`lecture_id` AS `lecture_id`,count(distinct `qa`.`user_id`) AS `participants_count`,count(distinct `qa`.`quiz_id`) AS `questions_count`,count(distinct `qa`.`group_id`) AS `groups_count`,count(0) AS `total_answers`,sum(`qa`.`is_correct`) AS `correct_answers`,round(((sum(`qa`.`is_correct`) * 100.0) / count(0)),2) AS `overall_accuracy_rate`,avg(`qa`.`answer_time_ms`) AS `avg_answer_time_ms` from `quiz_answers` `qa` group by `qa`.`lecture_id`;

-- ----------------------------
-- View structure for quiz_answer_stats
-- ----------------------------
DROP VIEW IF EXISTS `quiz_answer_stats`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `quiz_answer_stats` AS select `qa`.`lecture_id` AS `lecture_id`,`qa`.`quiz_id` AS `quiz_id`,`qa`.`group_id` AS `group_id`,count(0) AS `total_answers`,sum(`qa`.`is_correct`) AS `correct_answers`,round(((sum(`qa`.`is_correct`) * 100.0) / count(0)),2) AS `accuracy_rate`,avg(`qa`.`answer_time_ms`) AS `avg_answer_time_ms`,min(`qa`.`answered_at`) AS `first_answer_at`,max(`qa`.`answered_at`) AS `last_answer_at` from `quiz_answers` `qa` group by `qa`.`lecture_id`,`qa`.`quiz_id`,`qa`.`group_id`;

-- ----------------------------
-- View structure for user_quiz_stats
-- ----------------------------
DROP VIEW IF EXISTS `user_quiz_stats`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `user_quiz_stats` AS select `qa`.`user_id` AS `user_id`,`qa`.`lecture_id` AS `lecture_id`,count(0) AS `total_questions`,sum(`qa`.`is_correct`) AS `correct_answers`,round(((sum(`qa`.`is_correct`) * 100.0) / count(0)),2) AS `accuracy_rate`,count(distinct `qa`.`group_id`) AS `groups_participated`,avg(`qa`.`answer_time_ms`) AS `avg_answer_time_ms`,min(`qa`.`answered_at`) AS `first_answer_at`,max(`qa`.`answered_at`) AS `last_answer_at` from `quiz_answers` `qa` group by `qa`.`user_id`,`qa`.`lecture_id`;

SET FOREIGN_KEY_CHECKS = 1;
