const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routers/authRouters');
app.use('/api/auth', authRoutes);

const lectureRoutes = require('./routers/lectureRoutes');
app.use('/api/lectures', lectureRoutes);

const quizRoutes = require('./routers/quizRoutes');
app.use('/api/quizzes', quizRoutes);

const answerRoutes = require('./routers/answerRoutes');
app.use('/api/answers', answerRoutes);

const statisticsRoutes = require('./routers/statisticsRoutes');
app.use('/api/statistics', statisticsRoutes);

const fileRoutes = require('./routers/fileRouters');
app.use('/api/files', fileRoutes);

const uploadRoutes = require('./routers/uploadRouters');
app.use('/api/upload', uploadRoutes);

const participantRoutes = require('./routers/participantRoutes');
app.use('/api/participants', participantRoutes);

// 挂载反馈路由
const feedbackRoutes = require('./routers/feedbackRoutes');
app.use('/api/feedback', feedbackRoutes);

// 新增讨论区路由挂载
const discussionRoutes = require('./routers/discussionRoutes');
app.use('/api/discussion', discussionRoutes);


app.get('/', (req, res) => {
  res.send('✅✅✅PopQuiz 后端启动成功！');
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

