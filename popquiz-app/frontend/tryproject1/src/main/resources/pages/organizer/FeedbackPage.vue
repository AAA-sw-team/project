<template>
  <div class="feedback-wrapper">
    <div class="header-section">
      <div class="title-icon animate-bounce">📊</div>
      <h2 class="feedback-title animate-fade-in">听众反馈</h2>
      <p class="subtitle animate-fade-in-delay">收集听众的宝贵意见和建议</p>
    </div>
    <div class="content-section">
      <div class="feedbacks-section animate-slide-up-delay">
        <div class="section-header">
          <div class="section-icon">💬</div>
          <h3 class="section-title">详细反馈</h3>
        </div>
        <div v-if="feedbacks.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <h4>暂无反馈内容</h4>
          <p>听众的反馈将在这里展示</p>
        </div>
        <div v-else class="feedback-list">
          <div v-for="fb in feedbacks" :key="fb.listener" class="feedback-card animate-slide-in">
            <div class="feedback-header">
              <div class="user-info">
                <span class="user-avatar">👤</span>
                <span class="user-name">{{ fb.listener }}</span>
              </div>
            </div>
            <div class="feedback-body">
              <ul class="feedback-list-ul">
                <li v-for="(item, idx) in fb.options" :key="idx" class="feedback-item">{{ item }}</li>
                <li v-if="fb.other" class="feedback-item feedback-other">其他：{{ fb.other }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
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
.feedback-wrapper {
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
.header-section {
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
.content-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.2rem;
}
.section-icon {
  font-size: 1.2rem;
}
.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #10a37f;
  margin: 0;
}
.feedbacks-section {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(16, 163, 127, 0.1);
}
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #6b7280;
}
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}
.empty-state h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-weight: 600;
}
.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}
.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.feedback-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(16, 163, 127, 0.15);
  box-shadow: 0 2px 8px rgba(16, 163, 127, 0.08);
  transition: all 0.3s ease;
}
.feedback-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 163, 127, 0.15);
}
.feedback-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 1rem;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.user-avatar {
  font-size: 1.2rem;
}
.user-name {
  font-weight: 600;
  color: #10a37f;
  font-size: 1rem;
}
.feedback-body {
  color: #374151;
  line-height: 1.6;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}
.feedback-list-ul {
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
/* 动画 */
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
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}
.animate-fade-in-delay {
  animation: fadeIn 0.8s ease-out 0.3s both;
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-slide-up {
  animation: slideUp 0.6s ease-out;
}
.animate-slide-up-delay {
  animation: slideUp 0.6s ease-out 0.2s both;
}
.animate-slide-in {
  animation: slideInRight 0.5s ease-out;
}
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
