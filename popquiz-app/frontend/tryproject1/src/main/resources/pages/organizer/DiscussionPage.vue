<template>
  <div class="discussion-bg">
    <div class="discussion-card">
      <h3 class="discussion-title">讲座题目讨论区</h3>
      <div v-if="questions.length">
        <div class="discussion-question">
          <div class="discussion-qtext">题目{{ currentIndex + 1 }}：{{ currentQuestion.text }}</div>
          <div class="discussion-options">
            <span v-for="(opt, idx) in currentQuestion.options" :key="idx" class="discussion-option">
              {{ String.fromCharCode(65 + idx) }}. {{ opt }}
            </span>
          </div>
        </div>
        <div class="discussion-comments">
          <h4 class="discussion-comments-title">评论区</h4>
          <div v-if="currentQuestion.discussions && currentQuestion.discussions.length">
            <div v-for="comment in currentQuestion.discussions" :key="comment.id" class="discussion-comment">
              <b>{{ comment.user }}：</b>{{ comment.text }}
              <span class="discussion-reply-btn" @click="replyTo(comment)">回复</span>
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
          <div v-else class="discussion-no-comment">暂无评论</div>
          <div class="discussion-input-box">
            <input v-model="newComment" placeholder="输入评论..." />
            <button @click="addComment">发送</button>
          </div>
        </div>
        <div class="discussion-actions">
          <button @click="prevQuestion" :disabled="currentIndex === 0" class="discussion-btn">上一题</button>
          <button @click="nextQuestion" :disabled="currentIndex === questions.length - 1" class="discussion-btn">下一题</button>
        </div>
      </div>
      <div v-else>暂无题目</div>
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
/* 样式同之前 */
.discussion-bg {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
}
.discussion-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(44,209,171,0.07);
  padding: 40px 32px 32px 32px;
  max-width: 540px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.discussion-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d8c7f;
  margin-bottom: 18px;
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
.discussion-comments {
  width: 100%;
  margin-bottom: 12px;
}
.discussion-comments-title {
  font-size: 1.08rem;
  color: #2d8c7f;
  margin-bottom: 8px;
}
.discussion-comment {
  background: #f8fdfb;
  border: 1.5px solid #b2dfdb;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  font-size: 1rem;
  position: relative;
}
.discussion-reply-btn {
  color: #26c6da;
  cursor: pointer;
  margin-left: 12px;
  font-size: 0.95rem;
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
.discussion-no-comment {
  color: #aaa;
  font-size: 1rem;
  margin-bottom: 8px;
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
.discussion-input-box button {
  background: #26c6da;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 7px 18px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
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
</style>
