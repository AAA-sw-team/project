<template>
  <div class="score-bg">
    <div class="score-card">
      <h3 class="score-title">讲座成绩总览</h3>
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
  max-width: 600px;
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
.score-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 18px;
  background: #f8fdfb;
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
</style>
