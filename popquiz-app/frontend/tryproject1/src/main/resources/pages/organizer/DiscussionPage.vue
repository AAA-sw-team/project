<template>
  <div class="discussion-bg">
    <div class="discussion-card">
      <h3 class="discussion-title">讲座讨论区</h3>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-banner">
        <span class="error-icon">⚠️</span>
        <span>{{ error }}</span>
        <button @click="error = ''" class="error-close">✕</button>
      </div>
      
      <!-- 讨论消息列表 -->
      <div class="discussion-comments">
        <h4 class="discussion-comments-title">讨论内容</h4>
        
        <div v-if="messages.length > 0" class="discussion-messages">
          <div v-for="message in messages" :key="message.id" class="discussion-comment">
            <div class="comment-header">
              <span class="comment-user">{{ message.username }}</span>
              <span class="comment-time">{{ formatTime(message.created_at) }}</span>
            </div>
            <div class="comment-content">{{ message.message }}</div>
          </div>
        </div>
        
        <div v-else class="discussion-no-comment">暂无讨论内容</div>
        
        <!-- 发送新消息 -->
        <div class="discussion-input-box">
          <input v-model="newComment" 
                 placeholder="参与讨论..." 
                 @keyup.enter="addComment"
                 :disabled="loading" />
          <button @click="addComment" 
                  :disabled="!newComment.trim() || loading"
                  class="send-btn">
            {{ loading ? '发送中...' : '发送' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { AuthManager } from '../../../../utils/auth'

interface DiscussionMessage {
  id: number
  message: string
  username: string
  created_at: string
  user_id: number
}

const messages = ref<DiscussionMessage[]>([])
const newComment = ref('')
const loading = ref(false)
const error = ref('')
const pollingInterval = ref<number | null>(null)

// 获取当前讲座ID（从localStorage/sessionStorage或路由参数）
const lectureId = ref(localStorage.getItem('currentLectureId') || sessionStorage.getItem('currentLectureId') || '1')

onMounted(async () => {
  await loadDiscussionMessages()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})

// 加载讨论消息
async function loadDiscussionMessages() {
  try {
    const token = AuthManager.getToken()
    if (!token) {
      error.value = '请先登录'
      return
    }

    if (!lectureId.value) {
      error.value = '讲座ID不能为空'
      return
    }

    const response = await axios.get(`/api/discussion/lecture/${lectureId.value}/messages`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.data.success) {
      messages.value = response.data.data || []
      console.log('讨论消息加载成功:', messages.value.length, '条')
    } else {
      throw new Error(response.data.message || '获取讨论失败')
    }
  } catch (error: any) {
    console.error('加载讨论失败:', error)
    error.value = error.response?.data?.message || '获取讨论失败'
  }
}

// 添加新评论
async function addComment() {
  if (!newComment.value.trim()) return

  loading.value = true
  error.value = ''

  try {
    const token = AuthManager.getToken()
    if (!token) {
      throw new Error('请先登录')
    }

    if (!lectureId.value) {
      throw new Error('讲座ID不能为空')
    }

    const payload = {
      message: newComment.value.trim()
    }

    console.log('发送讨论消息:', payload)

    const response = await axios.post(`/api/discussion/lecture/${lectureId.value}/message`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.data.success) {
      newComment.value = ''
      // 立即重新加载消息
      await loadDiscussionMessages()
      console.log('讨论消息发送成功')
    } else {
      throw new Error(response.data.message || '发送消息失败')
    }

  } catch (error: any) {
    console.error('发送讨论失败:', error)
    error.value = error.response?.data?.message || error.message || '发送消息失败'
  } finally {
    loading.value = false
  }
}

// 开始轮询获取新消息
function startPolling() {
  pollingInterval.value = window.setInterval(async () => {
    try {
      await loadDiscussionMessages()
    } catch (error) {
      console.error('轮询讨论消息失败:', error)
    }
  }, 3000) // 每3秒刷新一次
}

// 停止轮询
function stopPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

// 格式化时间
function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>
<style scoped>
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
  padding: 24px;
  width: 90%;
  max-width: 800px;
  border: 1px solid rgba(44,209,171,0.15);
}

.discussion-title {
  text-align: center;
  font-size: 1.4rem;
  font-weight: 700;
  color: #2d8c7f;
  margin-bottom: 18px;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fca5a5;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.9rem;
  position: relative;
}

.error-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.error-close {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.error-close:hover {
  background-color: rgba(220, 38, 38, 0.1);
}

.discussion-comments {
  width: 100%;
  margin-bottom: 12px;
}

.discussion-comments-title {
  font-size: 1.08rem;
  color: #2d8c7f;
  margin-bottom: 16px;
  border-bottom: 2px solid #e0f2f1;
  padding-bottom: 8px;
}

.discussion-messages {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.discussion-comment {
  background: #f8fdfb;
  border: 1.5px solid #b2dfdb;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.discussion-comment:hover {
  border-color: #4db6ac;
  box-shadow: 0 2px 8px rgba(77, 182, 172, 0.1);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-user {
  font-weight: 600;
  color: #26c6da;
  font-size: 0.95rem;
}

.comment-time {
  font-size: 0.8rem;
  color: #6b7280;
}

.comment-content {
  color: #374151;
  font-size: 0.95rem;
  line-height: 1.4;
}

.discussion-no-comment {
  text-align: center;
  color: #9ca3af;
  padding: 2rem;
  font-size: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
  margin-bottom: 16px;
}

.discussion-input-box {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px;
  background: #f0fdfa;
  border-radius: 12px;
  border: 2px solid #a7f3d0;
}

.discussion-input-box input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #d1fae5;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s;
}

.discussion-input-box input:focus {
  outline: none;
  border-color: #10b981;
}

.discussion-input-box input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.send-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

.send-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.send-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>
