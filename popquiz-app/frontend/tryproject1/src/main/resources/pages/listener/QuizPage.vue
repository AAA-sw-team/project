<template>
  <div class="quiz-wrapper">
    <div class="page-header">
      <div class="title-icon animate-bounce">📝</div>
      <h2 class="quiz-title animate-fade-in">答题区域</h2>
      <p class="subtitle animate-fade-in-delay">参与互动，检验学习成果</p>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>AI正在生成题目，请稍候...</p>
    </div>
    
    <div v-else-if="currentQuestion" class="quiz-content">
      <div class="question-card">
        <div class="question-header">
          <div class="question-number">题目 {{ currentIndex + 1 }}</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${((currentIndex + 1) / questions.length) * 100}%` }"></div>
          </div>
        </div>
        
        <div class="question-text">{{ currentQuestion.text }}</div>
        
        <div class="options-container">
          <label v-for="(opt, idx) in currentQuestion.options" :key="idx" class="option-item" :class="{ selected: userAnswer === opt, disabled: answered }">
            <input type="radio" :value="opt" v-model="userAnswer" :disabled="answered" />
            <span class="option-content">{{ opt }}</span>
            <span class="option-indicator"></span>
          </label>
        </div>
        
        <div v-if="answered" class="feedback-section">
          <div v-if="isCorrect" class="feedback-correct">
            <span class="feedback-icon">✅</span>
            <span>回答正确！</span>
          </div>
          <div v-else class="feedback-wrong">
            <span class="feedback-icon">❌</span>
            <span>回答错误，正确答案是：{{ currentQuestion.answer }}</span>
          </div>
        </div>
        
        <div class="action-buttons">
          <button v-if="!isLast" @click="nextQuestion" :disabled="!userAnswer" class="action-btn primary">
            <span>下一题</span>
            <span class="btn-icon">→</span>
          </button>
          <button v-else @click="submitPaper" :disabled="!userAnswer" class="action-btn submit">
            <span class="btn-icon">📝</span>
            <span>提交试卷</span>
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="completion-state">
      <div class="completion-icon">🎉</div>
      <h3>答题完成！</h3>
      <p>恭喜您完成了所有题目</p>
      <router-link :to="`/listener/lecture/${lectureId}/score`" class="result-link">
        <span class="link-icon">📊</span>
        <span>查看成绩</span>
      </router-link>
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

// 模拟AI生成题目（实际应调用后端API，AI生成题目并返回）
async function fetchQuestions() {
  loading.value = true
  // 这里用静态数据，实际应调用API
  await new Promise(r => setTimeout(r, 1000))
  questions.value = [
    {
      text: 'Vue3的响应式原理基于什么？',
      options: ['Proxy', 'Object.defineProperty', 'Class', 'Reflect'],
      answer: 'Proxy'
    },
    {
      text: 'JavaScript的基本数据类型不包括？',
      options: ['String', 'Number', 'Class', 'Boolean'],
      answer: 'Class'
    }
  ]
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
.quiz-wrapper {
  max-width: 700px;
  margin: 0 auto;
  padding: 1.8rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(16, 163, 127, 0.12);
  border: 1px solid rgba(16, 163, 127, 0.1);
  position: relative;
  overflow: hidden;
  min-height: 70vh;
}

.quiz-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #10a37f 0%, #059669 50%, #047857 100%);
  z-index: 1;
}

.page-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.title-icon {
  font-size: 1.8rem;
  margin-bottom: 0.8rem;
  filter: drop-shadow(0 3px 6px rgba(16, 163, 127, 0.2));
}

.quiz-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #10a37f;
  margin: 0 0 0.4rem 0;
  letter-spacing: 0.3px;
  text-shadow: 0 1px 3px rgba(16, 163, 127, 0.1);
}

.subtitle {
  font-size: 1rem;
  color: #047857;
  margin: 0;
  font-weight: 500;
  opacity: 0.8;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #10a37f;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(16, 163, 127, 0.2);
  border-top: 3px solid #10a37f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.quiz-content {
  display: flex;
  justify-content: center;
}

.question-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 4px 20px rgba(16, 163, 127, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.question-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.question-number {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(16, 163, 127, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.question-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #047857;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.2rem;
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid rgba(16, 163, 127, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.option-item:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(16, 163, 127, 0.3);
  transform: translateY(-2px);
}

.option-item.selected {
  background: rgba(16, 163, 127, 0.1);
  border-color: #10a37f;
  box-shadow: 0 4px 15px rgba(16, 163, 127, 0.2);
}

.option-item.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.option-item input[type="radio"] {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #10a37f;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
}

.option-item input[type="radio"]:checked::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background: #10a37f;
  border-radius: 50%;
}

.option-content {
  flex: 1;
  font-size: 1rem;
  color: #374151;
  font-weight: 500;
}

.feedback-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
}

.feedback-correct {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #059669;
  font-weight: 600;
}

.feedback-wrong {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
  font-weight: 600;
}

.feedback-icon {
  font-size: 1.2rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  justify-content: center;
}

.action-btn.primary {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 163, 127, 0.3);
}

.action-btn.submit {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 163, 127, 0.4);
}

.action-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-icon {
  font-size: 1rem;
}

.completion-state {
  text-align: center;
  padding: 3rem 2rem;
}

.completion-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 4px 12px rgba(16, 163, 127, 0.3));
}

.completion-state h3 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #10a37f;
  margin: 0 0 0.5rem 0;
}

.completion-state p {
  font-size: 1rem;
  color: #047857;
  margin: 0 0 2rem 0;
  opacity: 0.8;
}

.result-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 163, 127, 0.3);
}

.result-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 163, 127, 0.4);
}

.link-icon {
  font-size: 1.1rem;
}

/* 动画效果 */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-fade-in-delay {
  animation: fadeIn 0.6s ease-out 0.2s both;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .quiz-wrapper {
    padding: 1rem;
    margin: 0.5rem;
  }
  
  .question-card {
    padding: 1.5rem;
  }
  
  .question-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>