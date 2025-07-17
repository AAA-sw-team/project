<template>
  <div class="feedback-bg">
    <div class="feedback-card">
      <h3 class="feedback-title">反馈</h3>
      <div class="feedback-options">
        <label v-for="(item, idx) in feedbackOptions" :key="idx" class="feedback-option">
          <input type="checkbox" v-model="selected" :value="item" />
          {{ item }}
        </label>
      </div>
      <textarea v-model="other" placeholder="其他建议..." class="feedback-textarea"></textarea>
      <button @click="submitFeedback" class="feedback-btn">提交反馈</button>
      <div v-if="submitted" class="feedback-thank">感谢您的反馈！</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const feedbackOptions = [
  '讲得太快', '讲得太慢', '演讲本身太乏味', '题目出得质量不好'
]
const selected = ref<string[]>([])
const other = ref('')
const submitted = ref(false)
function submitFeedback() {
  // 实际应提交到后端
  submitted.value = true
}
</script>
<style scoped>
.feedback-bg {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
}
.feedback-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(44,209,171,0.07);
  padding: 40px 32px 32px 32px;
  max-width: 420px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.feedback-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d8c7f;
  margin-bottom: 18px;
}
.feedback-options {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  margin-bottom: 18px;
}
.feedback-option {
  font-size: 1.08rem;
  color: #2d8c7f;
  display: flex;
  align-items: center;
  gap: 8px;
}
.feedback-textarea {
  width: 100%;
  min-height: 60px;
  border-radius: 8px;
  border: 1.5px solid #b2dfdb;
  padding: 10px;
  font-size: 1rem;
  margin-bottom: 18px;
  resize: vertical;
  box-sizing: border-box;
}
.feedback-btn {
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
  margin-bottom: 8px;
}
.feedback-btn:active {
  background: #3eaf7c;
}
.feedback-thank {
  color: #43a047;
  font-size: 1.1rem;
  margin-top: 10px;
  font-weight: 600;
}
</style>