<template>
  <div class="feedback-bg">
    <div class="feedback-card">
      <h3 class="feedback-title">听众反馈总览</h3>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-banner">
        <span class="error-icon">⚠️</span>
        <span>{{ error }}</span>
        <button @click="error = ''" class="error-close">✕</button>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载反馈内容...</p>
      </div>
      
      <!-- 反馈内容 -->
      <div v-else-if="feedbacks.length > 0" class="feedback-content">
        <div v-for="feedback in feedbacks" :key="feedback.id" class="feedback-listener-block">
          <div class="feedback-listener-name">
            {{ feedback.username }}
            <span class="feedback-time">{{ formatTime(feedback.created_at) }}</span>
          </div>
          <div class="feedback-details">
            <div class="feedback-type">
              <span class="type-label">反馈类型：</span>
              <span class="type-value">{{ feedback.feedbackTypeText }}</span>
            </div>
            <div v-if="feedback.feedback_message" class="feedback-message">
              <span class="message-label">详细建议：</span>
              <span class="message-value">{{ feedback.feedback_message }}</span>
            </div>
          </div>
        </div>
        
        <!-- 分页控制 -->
        <div v-if="pagination.totalPages > 1" class="pagination">
          <button @click="changePage(pagination.currentPage - 1)" 
                  :disabled="pagination.currentPage <= 1"
                  class="page-btn">
            上一页
          </button>
          <span class="page-info">
            第 {{ pagination.currentPage }} 页 / 共 {{ pagination.totalPages }} 页
          </span>
          <button @click="changePage(pagination.currentPage + 1)" 
                  :disabled="pagination.currentPage >= pagination.totalPages"
                  class="page-btn">
            下一页
          </button>
        </div>
      </div>
      
      <div v-else class="feedback-no">暂无反馈</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { AuthManager } from '../../../../utils/auth'

interface Feedback {
  id: number
  feedback_type: string
  feedback_message?: string
  feedbackTypeText: string
  created_at: string
  username: string
}

interface Pagination {
  currentPage: number
  totalPages: number
  total: number
  limit: number
}

const feedbacks = ref<Feedback[]>([])
const loading = ref(false)
const error = ref('')
const pagination = ref<Pagination>({
  currentPage: 1,
  totalPages: 1,
  total: 0,
  limit: 10
})

// 获取当前讲座ID（从localStorage/sessionStorage或路由参数）
const lectureId = ref(localStorage.getItem('currentLectureId') || sessionStorage.getItem('currentLectureId') || '1')

onMounted(async () => {
  await loadFeedbacks()
})

// 加载反馈数据
async function loadFeedbacks(page = 1) {
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

    const response = await axios.get(`/api/feedback/lecture/${lectureId.value}/all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        page,
        limit: pagination.value.limit
      }
    })

    if (response.data.success) {
      feedbacks.value = response.data.data.feedbacks || []
      pagination.value = {
        currentPage: response.data.data.pagination?.currentPage || 1,
        totalPages: response.data.data.pagination?.totalPages || 1,
        total: response.data.data.pagination?.total || 0,
        limit: response.data.data.pagination?.limit || 10
      }
      console.log('反馈数据加载成功:', feedbacks.value)
    } else {
      throw new Error(response.data.message || '获取反馈失败')
    }

  } catch (error: any) {
    console.error('加载反馈失败:', error)
    error.value = error.response?.data?.message || error.message || '获取反馈失败'
    feedbacks.value = []
  } finally {
    loading.value = false
  }
}

// 切换页面
async function changePage(page: number) {
  if (page >= 1 && page <= pagination.value.totalPages) {
    await loadFeedbacks(page)
  }
}

// 格式化时间
function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
  padding: 24px;
  width: 90%;
  max-width: 800px;
  border: 1px solid rgba(44,209,171,0.15);
}

.feedback-title {
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

.loading-container {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #2d8c7f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.feedback-time {
  font-size: 0.85rem;
  font-weight: normal;
  color: #6b7280;
}

.feedback-details {
  margin-top: 0.5rem;
}

.feedback-type, .feedback-message {
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.type-label, .message-label {
  font-weight: 600;
  color: #047857;
  margin-right: 0.5rem;
}

.type-value, .message-value {
  color: #374151;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.page-btn {
  padding: 0.5rem 1rem;
  background: #2d8c7f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #047857;
}

.page-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.page-info {
  color: #6b7280;
  font-size: 0.9rem;
}

.feedback-no {
  color: #aaa;
  font-size: 1.1rem;
  margin-top: 18px;
  text-align: center;
}
</style>
