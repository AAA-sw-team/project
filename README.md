# PopQuiz 项目文档

## 项目简介

AI 自动出题的课堂交互系统，提升讲课注意力检测效果。

本系统采用前后端分离架构，包含：

- 前端：Vue 3 + Vite，提供多角色（听众、讲者、组织者）交互界面
- 后端：Node.js + Express，RESTful API 服务
- 数据库：MySQL，存储用户、讲座、题目、答题等核心数据
- AI接口：支持自动生成选择题

## 团队成员

- 杜博妍
- 阮思羽
- 翟明玮

## 技术栈

- 前端：

  - Vue 3（Composition API）
  - Vite（前端构建与开发服务器）
  - Vue Router（前端路由管理）
  - Axios（前后端数据通信）
  - TypeScript（类型支持，部分页面）
  - 现代浏览器兼容性
- 后端：

  - Node.js（建议 18.x 及以上）
  - Express（Web 框架，RESTful API）
  - MySQL2（数据库驱动）
  - JWT（jsonwebtoken，用户认证与权限管理）
  - Multer（文件上传）
  - dotenv（环境变量管理）
  - bcryptjs（密码加密）
  - 其他依赖：body-parser、cors、uuid、mammoth、pdf-parse、pptx2json 等
- 数据库：

  - MySQL 8.x 及以上
  - 结构化表设计，支持讲座、用户、题目、答题、讨论、反馈等核心数据
- AI接口：

  - 已集成 deepseek 大模型 API（见 backend/utils/deepseek.js），用于自动生成单项选择题
  - 支持通过 RESTful API 调用本地或远程大模型服务（如 deepseek-r1:1.5b）
  - 输入：讲座相关内容
  - 输出：标准JSON格式的5道单项选择题（含题干、4个选项、标准答案）
  - 具备健壮的AI返回内容清洗、格式校验与错误处理能力
  - 依赖 axios、dotenv，支持自定义API地址和密钥
  - 可扩展对接其他大模型或云端AI服务
  - 详细用法见 utils/deepseek.js 文件注释
- 开发与部署工具：

  - npm（包管理）
  - VSCode、Cursor、copilot（AI-coding工具）
  - 使用 Git 进行版本管理

> 详细依赖请参考 `popquiz-app/backend/package.json` 和 `popquiz-app/frontend/tryproject1/package.json` 文件。

## ✅ 主要功能模块（按角色与路由划分）

### 1. 公共模块

- 登录、注册：支持三类角色（听众、讲者、组织者）账号注册与登录

### 2. 听众（listener）

- 听众首页（/listener/home）：
  - 加入讲座（输入讲座ID）
  - 查看自己已加入的讲座列表，支持重新进入
- 讲座内功能（/listener/lecture/:id）：
  - 答题（/quiz）：参与课堂选择题答题
  - 成绩查询（/score）：查看个人答题成绩与统计
  - 讨论区（/discussion）：参与师生互动讨论
  - 反馈（/feedback）：向讲者/组织者提交课堂反馈

### 3. 讲者（speaker）

- 讲者首页（/speaker/home）：
  - 查看自己主讲的讲座列表
- 讲座管理（/speaker/lecture/:id）：
  - 生成题目（/upload）：上传课件/文本，AI自动生成选择题
  - 答题情况（/stats）：实时查看学生答题统计与正确率
  - 师生讨论（/discussion）：与学生互动讨论
  - 学生反馈（/feedback）：查看学生课堂反馈

### 4. 组织者（organizer）

- 组织者首页（/organizer/home）：
  - 查看全部讲座信息
  - 查看全部用户信息（含角色、注册时间等）
- 讲座管理（/organizer/lectures/:id）：
  - 讨论区（/discussion）：查看/参与讲座讨论
  - 听众反馈（/feedback）：查看所有听众反馈

> 各角色功能互相独立，页面切换清晰，所有功能均可通过左侧/顶部导航或首页入口访问。

---

# 环境搭建与运行指南

## 1. 环境要求

- Node.js 版本：建议 18.x 及以上
- npm 版本：建议 9.x 及以上（Node.js 自带）
- MySQL 版本：建议 8.x 及以上
- 推荐操作系统：Windows 10/11、macOS、Linux

## 2. 克隆项目

```bash
git clone <项目仓库地址>
```

## 3. 后端环境搭建

### 3.1 安装依赖

```bash
cd popquiz-app/backend
npm install
```

### 3.2 配置环境变量

在 `popquiz-app/backend` 目录下新建 `.env` 文件，内容如下（请根据实际数据库信息填写）：

```
DB_HOST=localhost
DB_USER=你的数据库用户名
DB_PASSWORD=你的数据库密码
DB_NAME=popquiz
PORT=3001
```

### 3.3 初始化数据库

1. 启动你的 MySQL 服务。
2. 使用可视化工具（如 Navicat、DBeaver）或命令行，导入 `popquiz-app/backend/database/popquiz.sql` 文件。
   - 命令行示例：
     ```bash
     mysql -u你的用户名 -p popquiz < popquiz-app/backend/database/popquiz.sql
     ```

### 3.4 启动后端服务

```bash
npm run dev
```

- 默认端口：3001
- 启动成功后访问 http://localhost:3001/ 可看到“PopQuiz 后端启动成功！”

## 4. 前端环境搭建

### 4.1 安装依赖

```bash
cd popquiz-app/frontend/tryproject1
npm install
```

### 4.2 启动前端服务

```bash
npm run dev
```

- 默认端口：5173（如被占用会自动切换）
- 启动后访问 http://localhost:5173/
- 前端已配置接口代理，无需手动修改，自动转发 `/api` 请求到后端 3001 端口

## 5. 常见问题与排查

- **端口被占用**：如 3001 或 5173 被占用，请关闭占用程序或修改 `.env`/`vite.config.js` 中端口
- **依赖安装慢/失败**：建议切换 npm 源为淘宝镜像（`npm config set registry https://registry.npmmirror.com`）
- **数据库连接失败**：请检查 MySQL 是否启动、账号密码是否正确、端口是否为 3306
- **前后端接口不通**：确认前后端都已启动，且前端代理配置正确
- **如遇其他问题**：请先仔细核查本说明，仍无法解决可在群内留言

## 6. 目录结构说明

```
project/
├── popquiz-app/
│   ├── backend/         # 后端 Node.js 服务
│   └── frontend/
│       └── tryproject1/ # 前端 Vue3 + Vite 项目
```
