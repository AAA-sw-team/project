

<template>
  <div>
    <div class="organizer-container">
      <div class="organizer-header">
        <h2>欢迎，组织者</h2>
        <button class="logout-btn" @click="logout">退出</button>
      </div>
      <div class="activity-section">
        <h3>演讲活动管理</h3>
        <ul class="activity-list">
          <li v-for="lecture in lectures" :key="lecture.id" class="activity-item">
            <span>{{ lecture.title }}</span>
            <button class="view-btn" @click="viewStats(lecture.id)">查看统计</button>
          </li>
        </ul>
      </div>
      <div v-if="selectedStats" class="stats-section">
        <h3>统计信息</h3>
        <StatsChart :stats="selectedStats" />
        <div v-for="quiz in selectedStats.quizzes" :key="quiz.id" class="quiz-card-wrap">
          <QuizCard :quiz="quiz" :readonly="true" />
          <DiscussionArea :quizId="quiz.id" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StatsChart from '../components/StatsChart.vue'
import QuizCard from '../components/QuizCard.vue'
import DiscussionArea from '../components/DiscussionArea.vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const lectures = ref([])
const selectedStats = ref(null)
const router = useRouter()

onMounted(async () => {
  const res = await axios.get('/api/lecture/list')
  lectures.value = res.data.lectures
})

const viewStats = async (lectureId: string) => {
  const res = await axios.get(`/api/lecture/stats/${lectureId}`)
  selectedStats.value = res.data
}

const logout = () => {
  // 清除本地存储和状态
  // 可根据实际情况清除token等
  router.push('/login')
}
</script>

<style scoped>
.organizer-container {
  background: #fff;
  padding: 2.5rem 2rem 2rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(60, 120, 200, 0.12);
  width: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 40px auto;
}
.organizer-header {
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
.activity-section {
  width: 100%;
  margin-bottom: 1.2rem;
}
.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 0.5rem;
  border-bottom: 1px solid #f0f0f0;
}
.view-btn {
  background: #3eaf7c;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.3rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.view-btn:hover {
  background: #329c6b;
}
.stats-section {
  width: 100%;
  margin-top: 1.5rem;
}
.quiz-card-wrap {
  margin-top: 1.2rem;
  margin-bottom: 1.2rem;
  background: #f8f8f8;
  border-radius: 10px;
  padding: 1rem;
}
</style>
