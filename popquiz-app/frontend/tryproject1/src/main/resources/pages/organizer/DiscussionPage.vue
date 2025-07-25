<template>
  <div class="discussion-wrapper">
    <div class="header-section">
      <div class="title-icon animate-bounce">💬</div>
      <h2 class="discussion-title animate-fade-in">讲座讨论区</h2>
      <p class="subtitle animate-fade-in-delay">与听众实时交流，分享观点和见解</p>
    </div>
    <div class="content-section">
      <div v-if="questions.length === 0" class="empty-state">
        <div class="empty-icon">💭</div>
        <h4>暂无题目</h4>
        <p>请等待讲座发布题目后再来讨论吧！</p>
      </div>
      <div v-else>
        <div class="discussion-question">
          <div class="discussion-qtext">题目{{ currentIndex + 1 }}：{{ currentQuestion.text }}</div>
          <div class="discussion-options">
            <span v-for="(opt, idx) in currentQuestion.options" :key="idx" class="discussion-option">
              {{ String.fromCharCode(65 + idx) }}. {{ opt }}
            </span>
          </div>
        </div>
        <div class="comments-section animate-slide-up">
          <div class="section-header">
            <div class="section-icon">📝</div>
            <h3 class="section-title">讨论内容</h3>
          </div>
          <div v-if="currentQuestion.discussions && currentQuestion.discussions.length" class="comments-list">
            <div v-for="comment in currentQuestion.discussions" :key="comment.id" class="comment-card animate-slide-in">
              <div class="comment-header">
                <div class="user-info">
                  <span class="user-avatar">👤</span>
                  <span class="user-name">{{ comment.user }}</span>
                </div>
              </div>
              <div class="comment-body">{{ comment.text }}</div>
              <div class="comment-actions">
                <button class="reply-btn" @click="replyTo(comment)">回复</button>
              </div>
              <div v-if="replyingTo === comment.id" class="discussion-reply-box">
                <input v-model="replyContent" placeholder="回复内容..." />
                <button @click="sendReply(comment)">发送</button>
              </div>
              <div v-if="comment.replies && comment.replies.length" class="discussion-replies">
                <div v-for="reply in comment.replies" :key="reply.id" class="discussion-reply">
                  <b>{{ reply.user }}：</b>{{ reply.text }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">💬</div>
            <h4>暂无评论</h4>
            <p>成为第一个发表观点的人吧！</p>
          </div>
          <div class="discussion-input-box">
            <input v-model="newComment" placeholder="输入评论..." />
            <button class="submit-btn" @click="addComment">发送</button>
          </div>
        </div>
        <div class="discussion-actions">
          <button @click="prevQuestion" :disabled="currentIndex === 0" class="discussion-btn">上一题</button>
          <button @click="nextQuestion" :disabled="currentIndex === questions.length - 1" class="discussion-btn">下一题</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// 假设后端API返回如下结构
const questions = ref<any[]>([])
const currentIndex = ref(0)
const currentQuestion = computed(() => questions.value[currentIndex.value] || {})

const newComment = ref('')
const replyingTo = ref<number|null>(null)
const replyContent = ref('')

// mock: 模拟后端获取题目及讨论
onMounted(() => {
  questions.value = [
    {
      id: 1,
      text: 'Vue3的响应式原理基于什么？',
      options: ['Proxy', 'Object.defineProperty', 'Class', 'Reflect'],
      discussions: [
        { id: 1, user: 'Alice', text: '我觉得选Proxy', replies: [] },
        { id: 2, user: 'Bob', text: '讲师讲得很清楚', replies: [] }
      ]
    },
    {
      id: 2,
      text: 'JavaScript的基本数据类型不包括？',
      options: ['String', 'Number', 'Class', 'Boolean'],
      discussions: [
        { id: 3, user: 'Carol', text: 'Class不是基本类型', replies: [] }
      ]
    }
  ]
})

function addComment() {
  if (newComment.value.trim()) {
    currentQuestion.value.discussions.push({
      id: Date.now(),
      user: '我',
      text: newComment.value,
      replies: []
    })
    newComment.value = ''
  }
}
function replyTo(comment: any) {
  replyingTo.value = comment.id
  replyContent.value = ''
}
function sendReply(comment: any) {
  if (replyContent.value.trim()) {
    comment.replies = comment.replies || []
    comment.replies.push({ id: Date.now(), user: '我', text: replyContent.value })
    replyContent.value = ''
    replyingTo.value = null
  }
}
function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) currentIndex.value++
  replyingTo.value = null
  replyContent.value = ''
}
function prevQuestion() {
  if (currentIndex.value > 0) currentIndex.value--
  replyingTo.value = null
  replyContent.value = ''
}
</script>
<style scoped>
.discussion-wrapper {
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
.discussion-wrapper::before {
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
.discussion-title {
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
.discussion-question {
  width: 100%;
  margin-bottom: 18px;
}
.discussion-qtext {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}
.discussion-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 8px;
}
.discussion-option {
  background: #e0f7fa;
  color: #26c6da;
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 1rem;
}
.comments-section {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(16, 163, 127, 0.1);
}
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.comment-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 10px;
  padding: 1.2rem;
  border: 1px solid rgba(16, 163, 127, 0.15);
  box-shadow: 0 2px 8px rgba(16, 163, 127, 0.08);
  transition: all 0.3s ease;
}
.comment-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(16, 163, 127, 0.12);
}
.comment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.user-avatar {
  font-size: 1.1rem;
}
.user-name {
  font-weight: 600;
  color: #10a37f;
  font-size: 0.9rem;
}
.comment-body {
  color: #374151;
  line-height: 1.6;
  font-size: 0.95rem;
  margin-bottom: 0.8rem;
}
.comment-actions {
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
}
.reply-btn {
  background: linear-gradient(135deg, #e0f2fe 0%, #d1eefd 100%);
  color: #10a37f;
  border: 1px solid #10a37f;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.reply-btn:hover {
  background: linear-gradient(135deg, #cce6ff 0%, #b8e0ff 100%);
  color: #059669;
}
.discussion-reply-box {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}
.discussion-replies {
  margin-top: 6px;
  margin-left: 18px;
  border-left: 2px solid #b2dfdb;
  padding-left: 10px;
}
.discussion-reply {
  font-size: 0.97rem;
  color: #2d8c7f;
  margin-bottom: 4px;
}
.discussion-input-box {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.discussion-input-box input {
  flex: 1;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid #b2dfdb;
  font-size: 1rem;
}
.submit-btn {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 7px 18px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
}
.submit-btn:hover {
  background: #059669;
}
.discussion-actions {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-top: 12px;
}
.discussion-btn {
  background: #26c6da;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 28px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s;
  box-shadow: 0 1px 4px rgba(44,209,171,0.07);
}
.discussion-btn:disabled {
  background: #b2dfdb;
  color: #fff;
  cursor: not-allowed;
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
