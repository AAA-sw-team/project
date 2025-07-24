<template>
  <div class="feedback-wrapper">
    <div class="page-header">
      <div class="title-icon animate-bounce">💬</div>
      <h2 class="feedback-title animate-fade-in">意见反馈</h2>
      <p class="subtitle animate-fade-in-delay">您的意见对我们很重要，请分享您的想法</p>
    </div>

    <div class="feedback-content">
      <div class="feedback-card">
        <div v-if="!submitted" class="feedback-form">
          <div class="section">
            <h3 class="section-title">📋 选择反馈类型</h3>
            <div class="feedback-options">
              <label v-for="(item, idx) in feedbackOptions" :key="idx" class="feedback-option" :class="{ selected: selected.includes(item) }">
                <input type="checkbox" v-model="selected" :value="item" />
                <span class="option-content">{{ item }}</span>
                <span class="option-indicator"></span>
              </label>
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">✏️ 详细建议</h3>
            <div class="textarea-container">
              <textarea 
                v-model="other" 
                placeholder="请详细描述您的建议或意见，我们会认真考虑..."
                class="feedback-textarea"
                maxlength="500"
              ></textarea>
              <div class="char-count">{{ other.length }}/500</div>
            </div>
          </div>

          <div class="submit-section">
            <button @click="submitFeedback" class="submit-btn" :disabled="!canSubmit">
              <span class="btn-icon">📤</span>
              <span>提交反馈</span>
            </button>
            <p class="submit-hint">请至少选择一项反馈类型或填写建议</p>
          </div>
        </div>

        <div v-else class="success-state">
          <div class="success-icon">🎉</div>
          <h3>反馈提交成功！</h3>
          <p>感谢您的宝贵意见，我们会认真处理您的反馈</p>
          <div class="feedback-summary">
            <div v-if="selected.length > 0" class="summary-item">
              <span class="summary-label">反馈类型：</span>
              <span class="summary-value">{{ selected.join('、') }}</span>
            </div>
            <div v-if="other.trim()" class="summary-item">
              <span class="summary-label">详细建议：</span>
              <span class="summary-value">{{ other }}</span>
            </div>
          </div>
          <button @click="resetForm" class="reset-btn">
            <span>继续反馈</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'

const feedbackOptions = [
  '讲得太快', '讲得太慢', '演讲本身太乏味', '题目出得质量不好'
]

const selected = ref<string[]>([])
const other = ref('')
const submitted = ref(false)

const canSubmit = computed(() => {
  return selected.value.length > 0 || other.value.trim().length > 0
})

function submitFeedback() {
  // 实际应提交到后端
  if (canSubmit.value) {
    submitted.value = true
  }
}

function resetForm() {
  selected.value = []
  other.value = ''
  submitted.value = false
}
</script>
<style scoped>
.feedback-wrapper {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.8rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(16, 163, 127, 0.12);
  border: 1px solid rgba(16, 163, 127, 0.1);
  position: relative;
  overflow: hidden;
}

.feedback-wrapper::before {
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

.feedback-title {
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

.feedback-content {
  display: flex;
  justify-content: center;
}

.feedback-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(16, 163, 127, 0.1);
}

.section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #047857;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.feedback-options {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.feedback-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid rgba(16, 163, 127, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.feedback-option:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(16, 163, 127, 0.3);
  transform: translateY(-2px);
}

.feedback-option.selected {
  background: rgba(16, 163, 127, 0.1);
  border-color: #10a37f;
  box-shadow: 0 4px 15px rgba(16, 163, 127, 0.2);
}

.feedback-option input[type="checkbox"] {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #10a37f;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.feedback-option input[type="checkbox"]:checked::before {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #10a37f;
  font-weight: bold;
  font-size: 0.9rem;
}

.option-content {
  flex: 1;
  font-size: 1rem;
  color: #374151;
  font-weight: 500;
}

.textarea-container {
  position: relative;
}

.feedback-textarea {
  width: 100%;
  min-height: 120px;
  border: 2px solid rgba(16, 163, 127, 0.2);
  border-radius: 12px;
  padding: 1rem;
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.5;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  resize: vertical;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.feedback-textarea:focus {
  outline: none;
  border-color: #10a37f;
  box-shadow: 0 0 0 3px rgba(16, 163, 127, 0.1);
  background: rgba(255, 255, 255, 0.95);
}

.char-count {
  position: absolute;
  bottom: 0.5rem;
  right: 1rem;
  font-size: 0.8rem;
  color: #6b7280;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.submit-section {
  text-align: center;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 163, 127, 0.3);
  margin-bottom: 0.8rem;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 163, 127, 0.4);
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-icon {
  font-size: 1rem;
}

.submit-hint {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
}

.success-state {
  text-align: center;
  padding: 2rem 1rem;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 4px 12px rgba(16, 163, 127, 0.3));
}

.success-state h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #10a37f;
  margin: 0 0 0.5rem 0;
}

.success-state p {
  font-size: 1rem;
  color: #047857;
  margin: 0 0 2rem 0;
  opacity: 0.8;
}

.feedback-summary {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.summary-item {
  margin-bottom: 1rem;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-label {
  font-weight: 600;
  color: #047857;
  display: block;
  margin-bottom: 0.3rem;
}

.summary-value {
  color: #374151;
  line-height: 1.5;
}

.reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: rgba(16, 163, 127, 0.1);
  color: #10a37f;
  border: 2px solid #10a37f;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: #10a37f;
  color: white;
  transform: translateY(-1px);
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
  .feedback-wrapper {
    padding: 1rem;
    margin: 0.5rem;
  }
  
  .feedback-card {
    padding: 1.5rem;
  }
  
  .feedback-option {
    padding: 0.8rem;
  }
  
  .feedback-textarea {
    min-height: 100px;
  }
}
</style>