<template>
  <div>
    <div class="speaker-container">
      <div class="speaker-header">
        <h2>欢迎，演讲者</h2>
      </div>
      <div class="upload-section">
        <FileUpload @uploaded="onFileUploaded" />
        <button class="gen-btn" @click="generateQuiz" :disabled="!fileId">生成题目</button>
        <p v-if="!fileId" class="tip">请先上传内容文件（支持PPT、PDF、文本等）</p>
      </div>
      <div v-if="quizzes.length" class="quiz-list-section">
        <h3>已生成题目</h3>
        <div v-for="quiz in quizzes" :key="quiz.id" class="quiz-card-wrap">
          <QuizCard :quiz="quiz" :readonly="true" />
          <StatsChart :stats="quiz.stats" />
          <DiscussionArea :quizId="quiz.id" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FileUpload from '../components/FileUpload.vue'
import QuizCard from '../components/QuizCard.vue'
import StatsChart from '../components/StatsChart.vue'
import DiscussionArea from '../components/DiscussionArea.vue'
import axios from 'axios'

const fileId = ref('')
const quizzes = ref([])

const onFileUploaded = (id: string) => {
  fileId.value = id
}

const generateQuiz = async () => {
  const res = await axios.post('/api/quiz/generate', { fileId: fileId.value })
  quizzes.value = res.data.quizzes
}
</script>

<style scoped>
.speaker-container {
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
.speaker-header {
  width: 100%;
  display: flex;
  justify-content: center;
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
.upload-section {
  width: 100%;
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.gen-btn {
  width: 100%;
  padding: 0.7rem 0;
  background: #3eaf7c;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.8rem;
  margin-bottom: 0.5rem;
  transition: background 0.2s;
}
.gen-btn:disabled {
  background: #b2dfc7;
  cursor: not-allowed;
}
.gen-btn:hover:enabled {
  background: #329c6b;
}
.tip {
  color: #888;
  font-size: 0.98rem;
  margin-top: 0.2rem;
}
.quiz-list-section {
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