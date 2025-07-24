<template>
  <div class="score-bg">
    <div class="score-card">
      <h3 class="score-title">成绩查询</h3>
      <div class="score-summary">
        <div><b>正确率：</b><span class="score-accuracy">{{ accuracy }}%</span></div>
        <div><b>答题率：</b><span class="score-rate">{{ answerRate }}%</span></div>
      </div>
      <div v-if="questions.length">
        <div class="score-question-card">
          <div class="score-qtext">题目{{ currentIndex + 1 }}：{{ questions[currentIndex].text }}</div>
          <div class="score-answer">你的答案：<span :class="userAnswers[currentIndex] === questions[currentIndex].answer ? 'score-correct' : 'score-wrong'">{{ userAnswers[currentIndex] || '未作答' }}</span></div>
          <div class="score-answer">正确答案：<span>{{ questions[currentIndex].answer }}</span></div>
          <div v-if="userAnswers[currentIndex] === questions[currentIndex].answer" class="score-correct">✔ 正确</div>
          <div v-else class="score-wrong">✘ 错误</div>
        </div>
        <div class="score-actions">
          <button @click="prevQuestion" :disabled="currentIndex === 0" class="score-btn">上一题</button>
          <button @click="nextQuestion" :disabled="currentIndex === questions.length - 1" class="score-btn">下一题</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
const questions = ref([
  { text: 'Vue3的响应式原理基于什么？', answer: 'Proxy' },
  { text: 'JavaScript的基本数据类型不包括？', answer: 'Class' }
])
const userAnswers = ref(['Proxy', '']) // 静态实例：只答了第一题
const correctCount = computed(() =>
  questions.value.filter((q, i) => userAnswers.value[i] === q.answer).length
)
const answeredCount = computed(() =>
  userAnswers.value.filter(ans => ans !== '').length
)
const accuracy = computed(() =>
  questions.value.length ? Math.round((correctCount.value / questions.value.length) * 100) : 0
)
const answerRate = computed(() =>
  questions.value.length ? Math.round((answeredCount.value / questions.value.length) * 100) : 0
)
const currentIndex = ref(0)
function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) currentIndex.value++
}
function prevQuestion() {
  if (currentIndex.value > 0) currentIndex.value--
}
</script>
<style scoped>
.score-bg {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
}
.score-card {
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
.score-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #2d8c7f;
  margin-bottom: 18px;
}
.score-summary {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
  font-size: 1.15rem;
  justify-content: center;
}
.score-accuracy {
  color: #43a047;
  font-weight: bold;
}
.score-rate {
  color: #26c6da;
  font-weight: bold;
}
.score-question-card {
  background: #f8fdfb;
  border: 2px solid #b2dfdb;
  border-radius: 14px;
  box-shadow: 0 1px 6px rgba(44,209,171,0.06);
  padding: 28px 18px;
  margin-bottom: 18px;
  width: 100%;
  text-align: left;
}
.score-qtext {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}
.score-answer {
  font-size: 1rem;
  margin-bottom: 6px;
}
.score-correct {
  color: #43a047;
  font-weight: bold;
}
.score-wrong {
  color: #e53935;
  font-weight: bold;
}
.score-actions {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-top: 8px;
}
.score-btn {
  background: #26c6da;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 28px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s;
  box-shadow: 0 1px 4px rgba(44,209,171,0.07);
}
.score-btn:disabled {
  background: #b2dfdb;
  color: #fff;
  cursor: not-allowed;
}
</style>