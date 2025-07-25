<template>
  <div class="stats-wrapper">
    <div class="page-header">
      <div class="title-icon animate-bounce">📈</div>
      <h2 class="stats-title animate-fade-in">讲座成绩总览</h2>
      <p class="subtitle animate-fade-in-delay">查看讲座参与者的成绩与表现</p>
    </div>
    <div v-if="users.length === 0" class="empty-state">
      <div class="empty-icon">📄</div>
      <h3>暂无成绩数据</h3>
      <p>暂无参与者成绩信息</p>
    </div>
    <div v-else class="score-content">
      <table class="score-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>分数</th>
            <th>正确率</th>
            <th>答题率</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.score }}</td>
            <td><span class="score-accuracy">{{ user.accuracy }}%</span></td>
            <td><span class="score-rate">{{ user.answerRate }}%</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
// mock数据，实际应从API获取
const users = ref([
  { id: 1, name: '张三', score: 88, accuracy: 88, answerRate: 100 },
  { id: 2, name: '李四', score: 72, accuracy: 72, answerRate: 90 },
  { id: 3, name: '王五', score: 95, accuracy: 95, answerRate: 100 },
])
</script>
<style scoped>
.stats-wrapper {
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
.stats-wrapper::before {
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
.stats-title {
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
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #047857;
}
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}
.score-content {
  width: 100%;
}
.score-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 18px;
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(44,209,171,0.06);
}
.score-table th, .score-table td {
  padding: 14px 10px;
  text-align: center;
  font-size: 1rem;
}
.score-table th {
  background: #b2dfdb;
  color: #2d8c7f;
  font-weight: 700;
}
.score-table tr:nth-child(even) {
  background: #f6fcfa;
}
.score-table tr:nth-child(odd) {
  background: #f8fdfb;
}
.score-accuracy {
  color: #43a047;
  font-weight: bold;
}
.score-rate {
  color: #26c6da;
  font-weight: bold;
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
</style>
