<template>
  <div>
    <div class="listener-container">
      <div class="listener-header">
        <h2>欢迎，{{ nickname || "听众" }}</h2>
        <button class="logout-btn" @click="logout">退出</button>
      </div>
      <div class="quiz-section">
        <div v-if="quiz">
          <QuizCard :quiz="quiz" @submit="submitAnswer" />
        </div>
        <div v-else>
          <p class="no-quiz">暂无题目，请等待演讲者发布。</p>
        </div>
      </div>
      <UserStats :stats="stats" />
      <FeedbackForm @submit="submitFeedback" />
      <DiscussionArea v-if="quiz" :quizId="quiz.id" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import QuizCard from '../components/QuizCard.vue'
import UserStats from '../components/UserStats.vue'
import FeedbackForm from '../components/FeedbackForm.vue'
import DiscussionArea from '../components/DiscussionArea.vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const quiz = ref(null)
const stats = ref({ correct: 0, total: 0, rank: null })
const nickname = ref(localStorage.getItem('nickname') || '')

const router = useRouter()

onMounted(async () => {
  // 获取当前题目
  const res = await axios.get('/api/quiz/current')
  quiz.value = res.data.quiz
  // 获取个人统计
  const statRes = await axios.get('/api/user/stats')
  stats.value = statRes.data
  // 获取昵称（可根据实际后端返回调整）
  if (!nickname.value && statRes.data.nickname) {
    nickname.value = statRes.data.nickname
    localStorage.setItem('nickname', nickname.value)
  }
})

const submitAnswer = async (answer: any) => {
  await axios.post('/api/quiz/answer', answer)
  const statRes = await axios.get('/api/user/stats')
  stats.value = statRes.data
}

const submitFeedback = async (feedback: any) => {
  await axios.post('/api/feedback', feedback)
  alert('反馈已提交')
}

const logout = () => {
  // 清除本地存储和状态
  localStorage.removeItem('nickname')
  // 可根据实际情况清除token等
  router.push('/login')
}
</script>

<style scoped>
.listener-container {
  background: #fff;
  padding: 2.5rem 2rem 2rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(60, 120, 200, 0.12);
  width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 40px auto;
}
.listener-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
}
h2 {
  color: #3eaf7c;
  font-weight: 600;
  letter-spacing: 1px;
  font-size: 1.3rem;
  margin: 0;
}
.logout-btn {
  background: #f56c6c;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.4rem 1.1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.logout-btn:hover {
  background: #d9534f;
}
.quiz-section {
  width: 100%;
  margin-bottom: 1.2rem;
}
.no-quiz {
  color: #888;
  text-align: center;
  margin: 1.5rem 0;
  font-size: 1.1rem;
}
</style>