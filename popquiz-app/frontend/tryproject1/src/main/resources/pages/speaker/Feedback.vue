<template>
  <div class="feedback-wrapper">
    <h2>听众反馈</h2>
    <div v-if="loading">加载中...</div>
    <div v-else>
      <div v-for="feedback in feedbacks" :key="feedback.id" class="feedback-card">
        <div class="feedback-header">
          <span class="user">{{ feedback.userName }}</span>
          <span class="lecture">讲座ID: {{ feedback.lectureId }} | {{ feedback.lectureTitle }}</span>
        </div>
        <div class="feedback-body">{{ feedback.text }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// mock数据，后续可对接API
const loading = ref(true)
const feedbacks = ref([
  { id: 1, userName: '小明', lectureId: 1, lectureTitle: 'AI时代的未来', text: '讲得太快了，希望慢一点。' },
  { id: 2, userName: '小红', lectureId: 2, lectureTitle: '大数据与生活', text: '内容很有趣，但有些地方听不懂。' }
])

onMounted(() => {
  setTimeout(() => { loading.value = false }, 400)
})
</script>

<style scoped>
/* .feedback-wrapper {
  width: 100%;
  max-width: none;
  min-height: 70vh;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 6px 32px 0 rgba(255,179,0,0.13);
  padding: 2.5rem 3.5rem 2rem 3.5rem;
  margin: 2.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
} */
.feedback-card {
  width: 90%;               /* 由98%改为90%，宽度变窄 */
  border: 2px solid #ffb300;
  border-radius: 12px;
  background: #fffbe7;
  margin-bottom: 1.2rem;
  padding: 1.2rem 1.5rem;
  box-shadow: 0 2px 12px 0 rgba(255,179,0,0.08);
  transition: box-shadow 0.2s;
  margin-right: auto;      /* 让右边空白自动撑开 */
  margin-left: 0;          /* 左边贴边或者可根据需求调节 */
}

.feedback-card:hover {
  box-shadow: 0 4px 24px 0 rgba(255,179,0,0.16);
}
.feedback-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.7rem;
  font-size: 1.08rem;
  color: #b26a00;
  font-weight: 500;
}
.feedback-header .user {
  color: #ff9800;
}
.feedback-header .lecture {
  color: #b26a00;
  font-size: 0.98rem;
}
.feedback-body {
  font-size: 1.13rem;
  color: #333;
  line-height: 1.7;
}
</style> 