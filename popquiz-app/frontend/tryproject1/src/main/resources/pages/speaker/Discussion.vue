<template>
  <div class="discussion-wrapper">
    <h2>讨论区</h2>
    <div v-if="loading">加载中...</div>
    <div v-else>
      <div v-for="comment in comments" :key="comment.id" class="comment-card">
        <div class="comment-header">
          <span class="user">{{ comment.userName }}</span>
          <span class="lecture">讲座ID: {{ comment.lectureId }} | {{ comment.lectureTitle }}</span>
        </div>
        <div class="comment-body">{{ comment.text }}</div>
      </div>
      <form class="comment-form" @submit.prevent="submitComment">
        <h4>发表评论</h4>
        <select v-model="newComment.lectureId" required>
          <option value="" disabled>选择讲座</option>
          <option v-for="lecture in lectures" :key="lecture.id" :value="lecture.id">{{ lecture.title }}</option>
        </select>
        <textarea v-model="newComment.text" placeholder="输入评论..." required></textarea>
        <button type="submit">发送</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// mock数据，后续可对接API
const loading = ref(true)
const lectures = ref([
  { id: 1, title: 'AI时代的未来' },
  { id: 2, title: '大数据与生活' }
])
const comments = ref([
  { id: 1, userName: '小明', lectureId: 1, lectureTitle: 'AI时代的未来', text: '讲得很精彩！' },
  { id: 2, userName: '小红', lectureId: 2, lectureTitle: '大数据与生活', text: '收获很多，谢谢！' }
])
const newComment = ref({ lectureId: '', text: '' })
const speakerName = '演讲者本人'

const submitComment = () => {
  if (!newComment.value.lectureId || !newComment.value.text) return
  const lecture = lectures.value.find(l => String(l.id) === String(newComment.value.lectureId))
  if (!lecture) return
  comments.value.push({
    id: Date.now(),
    userName: speakerName,
    lectureId: lecture.id,
    lectureTitle: lecture.title,
    text: newComment.value.text
  })
  newComment.value.lectureId = ''
  newComment.value.text = ''
}

onMounted(() => {
  setTimeout(() => { loading.value = false }, 400)
})
</script>

<style scoped>
/* .discussion-wrapper {
  width: 100%;
  max-width: none;
  min-height: 70vh;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 6px 32px 0 rgba(60,120,200,0.13);
  padding: 2.5rem 3.5rem 2rem 3.5rem;
  margin: 2.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
} */
.comment-card {
  width: 90%; /* 卡片整体变短 */
  border: 2px solid #3eaf7c;
  border-radius: 12px;
  background: #f7fafc;
  margin: 0 auto 1.2rem auto; /* 居中 + 下边距 */
  padding: 1.2rem 1.5rem;
  box-shadow: 0 2px 12px 0 rgba(60,120,200,0.08);
  transition: box-shadow 0.2s;
}

.comment-card:hover {
  box-shadow: 0 4px 24px 0 rgba(60,120,200,0.16);
}
.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.7rem;
  font-size: 1.08rem;
  color: #2c3e50;
  font-weight: 500;
}
.comment-header .user {
  color: #3eaf7c;
}
.comment-header .lecture {
  color: #5b7fa6;
  font-size: 0.98rem;
}
.comment-body {
  font-size: 1.13rem;
  color: #333;
  line-height: 1.7;
}
.comment-form {
  width: 98%;
  margin-top: 2.5rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px 0 rgba(60,120,200,0.09);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.comment-form select,
.comment-form textarea {
  font-size: 1.08rem;
  padding: 0.6rem;
  border-radius: 6px;
  border: 1.5px solid #e0e0e0;
  outline: none;
  resize: vertical;
}
.comment-form button {
  align-self: flex-end;
  background: linear-gradient(90deg, #3eaf7c 60%, #b2dfc7 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.7rem 2.2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.comment-form button:hover {
  background: linear-gradient(90deg, #2ecc71 60%, #b2dfc7 100%);
}
</style> 