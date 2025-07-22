<template>
  <div class="upload-wrapper">
    <h2 class="upload-title">上传内容并生成题目</h2>
    <div class="upload-form">
      <label class="upload-label">
        <input type="file" class="upload-input" @change="handleFile" accept=".pdf,.ppt,.pptx,.txt,.mp3,.mp4" />
        <span class="upload-btn">选择文件</span>
      </label>
      <button class="main-btn" @click="generateQuiz" :disabled="!fileId">生成题目</button>
      <button class="main-btn" @click="publishQuiz" :disabled="!quizzes.length">发布题目</button>
    </div>
    <p v-if="!fileId" class="tip">请先上传内容文件（支持PPT、PDF、文本、音频、视频等）</p>
    <div v-if="quizzes.length" class="quiz-list-section">
      <h3 class="quiz-list-title">已生成题目</h3>
      <div class="quiz-bubble-list">
        <div v-for="(quiz, idx) in quizzes" :key="quiz.id ?? idx" class="quiz-bubble">
          <div class="bubble-header">题目 {{ idx + 1 }}</div>
          <QuizCard :quiz="quiz" :readonly="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

interface Quiz {
  id: string | number
  question: string
  options: string[]
}

const fileId = ref('')
const quizzes = ref<Quiz[]>([])
const route = useRoute()
const lectureId = route.params.lectureId as string


// 获取本地token，支持Bearer
function getAuthHeader() {
  const token = localStorage.getItem('token') || ''
  if (!token) return {}
  return {
    Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
  }
}

const handleFile = async (e: any) => {
  const file = e.target.files[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  // 调试日志
  console.log('lectureId:', lectureId)
  console.log('token:', localStorage.getItem('token'))
  console.log('upload url:', `/api/quizzes/upload/${lectureId}`)
  try {
    const res = await axios.post(`/api/quizzes/upload/${lectureId}`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    })
    console.log('upload response:', res)
    fileId.value = res.data.fileId
  } catch (err) {
    console.error('upload error:', err)
    if (err.response) {
      console.error('error response:', err.response)
    }
    alert('上传失败，请检查 lectureId、token、接口路径和后端日志！')
  }
}

const generateQuiz = async () => {
  if (!fileId.value) return
  // 路径与后端保持一致
  const res = await axios.post(`/api/quizzes/generate/${lectureId}`, { fileId: fileId.value }, {
    headers: getAuthHeader()
  })
  quizzes.value = res.data.quizzes
}

const publishQuiz = async () => {
  if (!quizzes.value.length) return
  await axios.post(`/api/quizzes/publish/${lectureId}`, { quizzes: quizzes.value }, {
    headers: getAuthHeader()
  })
  alert('题目已发布！')
}
</script>

<style scoped>
/* .upload-wrapper {
  width: 100%;
  padding: 1.2rem 3rem 2rem 3rem;
  margin: 1.2rem 0 2.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
} */

.upload-title {
  font-size: 2rem;
  font-weight: 700;
  color: #10a37f;
  margin-bottom: 2rem;
  letter-spacing: 1px;
}
.upload-form {
  width: 100%;
  /* max-width: 500px; */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 1.8rem;
}
.upload-label {
  width: 100%;
  display: flex;
  justify-content: center;
}
.upload-input {
  display: none;
}
.upload-btn {
  display: inline-block;
  background: #10a37f;
  color: #fff;
  font-weight: 600;
  border-radius: 999px;
  padding: 0.9rem 2.8rem;
  font-size: 1.15rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(16,163,127,0.08);
  transition: background 0.2s;
}
.upload-btn:hover {
  background: #0e8c6b;
}
.main-btn {
  width: 220px;
  align-self: center;
  padding: 0.9rem 0;
  background: #10a37f;
  color: #fff;
  border: none;
  border-radius: 999px;
  font-size: 1.15rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 0.3rem;
  box-shadow: 0 2px 8px rgba(16,163,127,0.08);
  transition: background 0.2s;
}
.main-btn:disabled {
  background: #b2dfc7;
  cursor: not-allowed;
}
.main-btn:hover:enabled {
  background: #0e8c6b;
}
.tip {
  color: #888;
  font-size: 1.08rem;
  margin-top: 0.2rem;
  margin-bottom: 0.7rem;
}
.quiz-list-section {
  width: 100%;
  margin-top: 2.2rem;
}
.quiz-list-title {
  color: #10a37f;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
}
.quiz-bubble-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.quiz-bubble {
  background: #f7fafc;
  border-radius: 1.2em 1.2em 1.2em 0.3em;
  box-shadow: 0 2px 8px rgba(60,120,200,0.08);
  padding: 1.3rem 2.2rem 1.3rem 2.2rem;
  max-width: 100%;
  margin-left: 0;
  margin-right: auto;
  position: relative;
}
.bubble-header {
  font-size: 1.08rem;
  color: #10a37f;
  font-weight: 600;
  margin-bottom: 0.7rem;
}
@media (max-width: 900px) {
  .upload-form {
    max-width: 98vw;
    padding: 1.2rem 0.5rem;
  }
  .quiz-bubble {
    padding: 0.7rem 0.7rem 0.7rem 0.7rem;
    max-width: 100%;
  }
}
</style>

<!-- ✅ 全局背景灰白设置 -->
<style>
body {
  background: #f5f5f5;
}
</style>
