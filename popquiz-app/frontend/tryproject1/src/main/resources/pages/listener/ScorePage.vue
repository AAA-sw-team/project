<template>
  <div class="score-wrapper">
    <div class="page-header">
      <div class="title-icon animate-bounce">📊</div>
      <h2 class="score-title animate-fade-in">成绩报告</h2>
      <p class="subtitle animate-fade-in-delay">查看答题结果与详细分析</p>
    </div>

    <div class="score-content">
      <!-- 成绩概览 -->
      <div class="score-overview">
        <div class="stats-grid">
          <div class="stat-card accuracy">
            <div class="stat-icon">🎯</div>
            <div class="stat-number">{{ accuracy }}%</div>
            <div class="stat-label">正确率</div>
            <div class="stat-description">{{ correctCount }}/{{ questions.length }} 题正确</div>
          </div>
          <div class="stat-card completion">
            <div class="stat-icon">📝</div>
            <div class="stat-number">{{ answerRate }}%</div>
            <div class="stat-label">完成率</div>
            <div class="stat-description">{{ answeredCount }}/{{ questions.length }} 题作答</div>
          </div>
          <div class="stat-card performance" :class="getPerformanceClass()">
            <div class="stat-icon">⭐</div>
            <div class="stat-number">{{ getPerformanceLevel() }}</div>
            <div class="stat-label">评价等级</div>
            <div class="stat-description">{{ getPerformanceDesc() }}</div>
          </div>
        </div>
      </div>

      <!-- 题目详情 -->
      <div v-if="questions.length" class="questions-section">
        <h3 class="section-title">📋 题目详情</h3>
        
        <div class="question-navigation">
          <div class="nav-info">
            <span class="current-question">第 {{ currentIndex + 1 }} 题</span>
            <span class="total-questions">共 {{ questions.length }} 题</span>
          </div>
          <div class="nav-buttons">
            <button @click="prevQuestion" :disabled="currentIndex === 0" class="nav-btn prev">
              <span>←</span>
              <span>上一题</span>
            </button>
            <button @click="nextQuestion" :disabled="currentIndex === questions.length - 1" class="nav-btn next">
              <span>下一题</span>
              <span>→</span>
            </button>
          </div>
        </div>

        <div class="question-card">
          <div class="question-header">
            <div class="question-number">题目 {{ currentIndex + 1 }}</div>
            <div class="result-badge" :class="getQuestionResultClass(currentIndex)">
              {{ getQuestionResultText(currentIndex) }}
            </div>
          </div>
          
          <div class="question-content">
            <div class="question-text">{{ questions[currentIndex].text }}</div>
            
            <div class="answer-section">
              <div class="user-answer">
                <span class="answer-label">您的答案：</span>
                <span class="answer-value" :class="getUserAnswerClass(currentIndex)">
                  {{ userAnswers[currentIndex] || '未作答' }}
                </span>
              </div>
              
              <div class="correct-answer">
                <span class="answer-label">正确答案：</span>
                <span class="answer-value correct">{{ questions[currentIndex].answer }}</span>
              </div>
            </div>
            
            <div class="feedback-section">
              <div v-if="userAnswers[currentIndex] === questions[currentIndex].answer" class="feedback success">
                <span class="feedback-icon">✅</span>
                <span class="feedback-text">回答正确！</span>
              </div>
              <div v-else-if="userAnswers[currentIndex]" class="feedback error">
                <span class="feedback-icon">❌</span>
                <span class="feedback-text">回答错误</span>
              </div>
              <div v-else class="feedback skipped">
                <span class="feedback-icon">⏭️</span>
                <span class="feedback-text">未作答</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 题目进度指示器 -->
        <div class="progress-indicators">
          <div 
            v-for="(question, index) in questions" 
            :key="index"
            class="progress-dot"
            :class="{ active: index === currentIndex, ...getProgressDotClass(index) }"
            @click="currentIndex = index"
          >
            {{ index + 1 }}
          </div>
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

// 获取表现等级样式
function getPerformanceClass() {
  const acc = accuracy.value
  if (acc >= 90) return 'excellent'
  if (acc >= 80) return 'good'
  if (acc >= 70) return 'fair'
  return 'poor'
}

// 获取表现等级
function getPerformanceLevel() {
  const acc = accuracy.value
  if (acc >= 90) return 'A'
  if (acc >= 80) return 'B'
  if (acc >= 70) return 'C'
  return 'D'
}

// 获取表现描述
function getPerformanceDesc() {
  const acc = accuracy.value
  if (acc >= 90) return '优秀'
  if (acc >= 80) return '良好'
  if (acc >= 70) return '及格'
  return '需改进'
}

// 获取题目结果样式
function getQuestionResultClass(index: number) {
  if (!userAnswers.value[index]) return 'skipped'
  return userAnswers.value[index] === questions.value[index].answer ? 'correct' : 'incorrect'
}

// 获取题目结果文本
function getQuestionResultText(index: number) {
  if (!userAnswers.value[index]) return '未作答'
  return userAnswers.value[index] === questions.value[index].answer ? '正确' : '错误'
}

// 获取用户答案样式
function getUserAnswerClass(index: number) {
  if (!userAnswers.value[index]) return 'unanswered'
  return userAnswers.value[index] === questions.value[index].answer ? 'correct' : 'incorrect'
}

// 获取进度点样式
function getProgressDotClass(index: number) {
  if (!userAnswers.value[index]) return { skipped: true }
  return userAnswers.value[index] === questions.value[index].answer ? { correct: true } : { incorrect: true }
}
</script>

<style scoped>
.score-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.8rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(16, 163, 127, 0.12);
  border: 1px solid rgba(16, 163, 127, 0.1);
  position: relative;
  overflow: hidden;
}

.score-wrapper::before {
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

.score-title {
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

.score-overview {
  margin-bottom: 2.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(16, 163, 127, 0.1);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #047857;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.stat-description {
  font-size: 0.8rem;
  color: #6b7280;
}

.stat-card.accuracy .stat-number {
  color: #059669;
}

.stat-card.completion .stat-number {
  color: #10a37f;
}

.stat-card.performance.excellent .stat-number {
  color: #059669;
}

.stat-card.performance.good .stat-number {
  color: #10a37f;
}

.stat-card.performance.fair .stat-number {
  color: #f59e0b;
}

.stat-card.performance.poor .stat-number {
  color: #ef4444;
}

.questions-section {
  margin-top: 2rem;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #10a37f;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.question-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
}

.nav-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.current-question {
  font-size: 1.1rem;
  font-weight: 600;
  color: #10a37f;
}

.total-questions {
  font-size: 0.9rem;
  color: #6b7280;
}

.nav-buttons {
  display: flex;
  gap: 0.5rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 1rem;
  background: #10a37f;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

.nav-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.question-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(16, 163, 127, 0.1);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.question-number {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.result-badge {
  padding: 0.4rem 1rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.result-badge.correct {
  background: #059669;
}

.result-badge.incorrect {
  background: #ef4444;
}

.result-badge.skipped {
  background: #6b7280;
}

.question-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #047857;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.answer-section {
  margin-bottom: 1.5rem;
}

.user-answer,
.correct-answer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
}

.answer-label {
  font-weight: 600;
  color: #374151;
  min-width: 80px;
}

.answer-value {
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.answer-value.correct {
  color: #059669;
  background: rgba(5, 150, 105, 0.1);
}

.answer-value.incorrect {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.answer-value.unanswered {
  color: #6b7280;
  background: rgba(107, 114, 128, 0.1);
}

.feedback-section {
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
}

.feedback {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.feedback.success {
  color: #059669;
}

.feedback.error {
  color: #ef4444;
}

.feedback.skipped {
  color: #6b7280;
}

.feedback-icon {
  font-size: 1.1rem;
}

.progress-indicators {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.progress-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #e5e7eb;
  background: white;
  color: #6b7280;
}

.progress-dot.active {
  border-color: #10a37f;
  background: #10a37f;
  color: white;
  transform: scale(1.1);
}

.progress-dot.correct {
  border-color: #059669;
  background: #059669;
  color: white;
}

.progress-dot.incorrect {
  border-color: #ef4444;
  background: #ef4444;
  color: white;
}

.progress-dot.skipped {
  border-color: #9ca3af;
  background: #9ca3af;
  color: white;
}

.progress-dot:hover {
  transform: scale(1.05);
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
  .score-wrapper {
    padding: 1rem;
    margin: 0.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .question-navigation {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-buttons {
    width: 100%;
    justify-content: space-between;
  }
  
  .question-card {
    padding: 1.5rem;
  }
  
  .question-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .progress-indicators {
    gap: 0.3rem;
  }
  
  .progress-dot {
    width: 32px;
    height: 32px;
    font-size: 0.7rem;
  }
}
</style>