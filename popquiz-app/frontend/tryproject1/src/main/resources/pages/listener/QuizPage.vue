<template>
  <div class="quiz-page-bg">
    <div class="quiz-card">
      <h3 class="quiz-title">答题</h3>
      <div v-if="loading" class="quiz-loading">AI正在生成题目，请稍候...</div>
      <div v-else-if="currentQuestion">
        <div class="quiz-question">题目 {{ currentIndex + 1 }}：{{ currentQuestion.text }}</div>
        <div class="quiz-options">
          <label v-for="(opt, idx) in currentQuestion.options" :key="idx" class="quiz-option">
            <input type="radio" :value="opt" v-model="userAnswer" :disabled="answered" />
            {{ opt }}
          </label>
        </div>
        <div class="quiz-actions">
          <button v-if="!isLast" @click="nextQuestion" :disabled="!userAnswer" class="quiz-btn">下一题</button>
          <button v-else @click="submitPaper" :disabled="!userAnswer" class="quiz-btn quiz-submit">提交试卷</button>
        </div>
        <div v-if="answered" class="quiz-feedback">
          <span v-if="isCorrect" class="quiz-correct">✔ 正确</span>
          <span v-else class="quiz-wrong">✘ 错误</span>
        </div>
      </div>
      <div v-else class="quiz-finish">
        <h4>答题结束！</h4>
        <router-link :to="`/listener/lecture/${lectureId}/score`" class="quiz-link">查看成绩</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const lectureId = route.params.id
const questions = ref<any[]>([])
const currentIndex = ref(0)
const userAnswer = ref('')
const userAnswers = ref<string[]>([])
const answered = ref(false)
const isCorrect = ref(false)
const loading = ref(true)
const currentQuestion = computed(() => questions.value[currentIndex.value])
const isLast = computed(() => currentIndex.value === questions.value.length - 1)

// 获取后端AI生成的题目
async function fetchQuestions() {
  loading.value = true
  const token = localStorage.getItem('authToken')
  const res = await fetch(`/api/quizzes/${lectureId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  if (res.ok) {
    const data = await res.json()
    // 题目格式适配
    questions.value = data.map((q: any) => ({
      text: q.question,
      options: [q.option_a, q.option_b, q.option_c, q.option_d],
      answer: q.correct_option
    }))
  } else {
    questions.value = []
  }
  loading.value = false
}

onMounted(fetchQuestions)

function nextQuestion() {
  if (!userAnswer.value) return
  userAnswers.value[currentIndex.value] = userAnswer.value
  answered.value = true
  isCorrect.value = userAnswer.value === currentQuestion.value.answer
  setTimeout(() => {
    if (currentIndex.value < questions.value.length - 1) {
      currentIndex.value++
      userAnswer.value = ''
      answered.value = false
      isCorrect.value = false
    }
  }, 500)
}
function submitPaper() {
  if (!userAnswer.value) return
  userAnswers.value[currentIndex.value] = userAnswer.value
  // 这里可以跳转到成绩页或显示提交成功
  questions.value.length = 0 // 静态实例：清空题目表示已提交
}
</script>

<style scoped>
.quiz-page-bg {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
}
.quiz-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(44,209,171,0.07);
  padding: 40px 32px 32px 32px;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.quiz-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #2d8c7f;
  margin-bottom: 24px;
}
.quiz-question {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 18px;
  color: #333;
}
.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 18px;
  width: 100%;
}
.quiz-option {
  font-size: 1rem;
  color: #2d8c7f;
  display: flex;
  align-items: center;
  gap: 8px;
}
.quiz-actions {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-bottom: 12px;
  width: 100%;
}
.quiz-btn {
  background: #26c6da;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s;
  box-shadow: 0 1px 4px rgba(44,209,171,0.07);
}
.quiz-btn:disabled {
  background: #b2dfdb;
  color: #fff;
  cursor: not-allowed;
}
.quiz-submit {
  background: #3eaf7c;
}
.quiz-feedback {
  margin-top: 8px;
  font-size: 1.1rem;
}
.quiz-correct {
  color: #43a047;
  font-weight: bold;
}
.quiz-wrong {
  color: #e53935;
  font-weight: bold;
}
.quiz-loading {
  color: #26c6da;
  font-size: 1.1rem;
  margin: 32px 0;
}
.quiz-finish {
  text-align: center;
  margin-top: 32px;
}
.quiz-link {
  color: #26c6da;
  font-weight: 600;
  text-decoration: underline;
  font-size: 1.1rem;
}
</style>