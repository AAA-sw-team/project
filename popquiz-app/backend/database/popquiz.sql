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

 Date: 23/07/2025 14:34:23
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

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
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of files
-- ----------------------------
INSERT INTO `files` VALUES (1, 2, 2, 'passage.txt', 'e:\\project-1\\popquiz-app\\uploads\\2-1753015514396-passage.txt', 'text/plain', '2025-07-20 20:45:14');

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
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of lectures
-- ----------------------------
INSERT INTO `lectures` VALUES (1, 'AI时代的未来', '关于人工智能的发展趋势和应用', 2, '2025-07-15 18:05:08', 0, NULL, NULL);
INSERT INTO `lectures` VALUES (2, '测试讲座', '测试上传文件，生成题目', 2, '2025-07-20 20:19:20', 0, NULL, NULL);
INSERT INTO `lectures` VALUES (3, '重新测试', '好烦好烦,不想测试！！！', 2, '2025-07-22 17:00:57', 0, NULL, NULL);
INSERT INTO `lectures` VALUES (4, '重新测试', '好烦好烦,不想测试！！！', 2, '2025-07-22 17:02:01', 0, NULL, NULL);
INSERT INTO `lectures` VALUES (5, '重新测试', '好烦好烦,不想测试！！！', 2, '2025-07-22 17:02:06', 0, NULL, NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of quiz_answers
-- ----------------------------
INSERT INTO `quiz_answers` VALUES (1, 1, 1, 'C', 1, '2025-07-16 18:33:12');

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

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
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

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
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'test02', '$2b$10$Sk3uXbFIt.H37ak.QCYa9Ob4DCARPXvqB43O15q5Y1ZHv0A/dxJv6', 'listener', '新手用户', '2025-07-14 20:49:33');
INSERT INTO `users` VALUES (2, 'test01', '$2b$10$JpGbUjMXBZrhU2ImgnC55OivN0Syv.3E9h5WihWgIb91jVTFSgxK6', 'speaker', 'AI讲师小白', '2025-07-14 21:13:15');
INSERT INTO `users` VALUES (5, 'dubyann', '$2b$10$hOEMvv/KEbbJGqozqnZM8.dtgeRKP42x9efTdeUaVxR81ZgW2tAeC', 'speaker', '讲师不想写代码', '2025-07-22 17:20:23');

SET FOREIGN_KEY_CHECKS = 1;
