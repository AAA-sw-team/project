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
app.use('/api/quizzes',quizRoutes );

const answerRoutes = require('./routes/answerRoutes');
app.use('/api/answers', answerRoutes);

const statisticsRoutes = require('./routes/statisticsRoutes');
app.use('/api/statistics', statisticsRoutes);

app.get('/', (req, res) => {
  res.send('✅✅✅PopQuiz 后端启动成功！');
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

