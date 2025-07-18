<template>
  <div class="feedback-bg">
    <div class="feedback-card">
      <h3 class="feedback-title">听众反馈总览</h3>
      <div v-if="feedbacks.length">
        <div v-for="fb in feedbacks" :key="fb.listener" class="feedback-listener-block">
          <div class="feedback-listener-name">{{ fb.listener }}</div>
          <ul class="feedback-list">
            <li v-for="(item, idx) in fb.options" :key="idx" class="feedback-item">{{ item }}</li>
            <li v-if="fb.other" class="feedback-item feedback-other">其他：{{ fb.other }}</li>
          </ul>
        </div>
      </div>
      <div v-else class="feedback-no">暂无反馈</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
// mock数据，实际应从后端获取
const feedbacks = ref([
  {
    listener: '张三',
    options: ['讲得太快', '题目出得质量不好'],
    other: '希望多举例子'
  },
  {
    listener: '李四',
    options: ['演讲本身太乏味'],
    other: ''
  },
  {
    listener: '王五',
    options: ['讲得太慢'],
    other: '建议增加互动'
  }
])
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
  max-width: 480px;
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
.feedback-listener-block {
  width: 100%;
  background: #f8fdfb;
  border: 2px solid #b2dfdb;
  border-radius: 12px;
  margin-bottom: 18px;
  padding: 16px 18px 10px 18px;
  box-sizing: border-box;
}
.feedback-listener-name {
  font-size: 1.13rem;
  font-weight: 700;
  color: #26c6da;
  margin-bottom: 8px;
}
.feedback-list {
  padding-left: 18px;
  margin: 0;
}
.feedback-item {
  font-size: 1.05rem;
  color: #2d8c7f;
  margin-bottom: 4px;
}
.feedback-other {
  color: #e53935;
}
.feedback-no {
  color: #aaa;
  font-size: 1.1rem;
  margin-top: 18px;
}
</style>
