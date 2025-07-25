<template>
  <div class="discussion-wrapper">
    <div class="header-section">
      <div class="title-icon animate-bounce">💬</div>
      <h2 class="discussion-title animate-fade-in">讲座讨论区</h2>
      <p class="subtitle animate-fade-in-delay">与听众实时交流，分享观点和见解</p>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载讨论内容...</p>
    </div>
    
    <div v-else class="content-section">
      <!-- 讲师可发公告 -->
      <div v-if="userRole === 'organizer' || userRole === 'speaker'" class="announcement-section">
        <form @submit.prevent="sendAnnouncement" class="announcement-form">
          <input v-model="announcementText" placeholder="发布公告（自动置顶）" class="announcement-input" />
          <button type="submit" class="announcement-btn" :disabled="!announcementText.trim()">发布公告</button>
        </form>
      </div>
      <!-- 讨论列表 -->
      <div class="comments-section animate-slide-up">
        <div class="section-header">
          <div class="section-icon">📝</div>
          <h3 class="section-title">讨论内容</h3>
        </div>
        
        <div v-if="comments.length === 0" class="empty-state">
          <div class="empty-icon">💭</div>
          <h4>还没有讨论内容</h4>
          <p>成为第一个发表观点的人吧！</p>
        </div>
        
        <div v-else class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-card animate-slide-in" :class="{ pinned: comment.isPinned }">
            <div class="comment-header">
              <div class="user-info">
                <span class="user-avatar">👤</span>
                <span class="user-name">{{ comment.userName }}</span>
                <span class="user-badge" v-if="comment.userName === speakerName">演讲者</span>
                <span class="pinned-badge" v-if="comment.isPinned">📌置顶</span>
              </div>
              <span class="comment-time">{{ formatTime(comment.time) }}</span>
            </div>
            <div class="comment-body">{{ comment.text }}</div>
            <div class="comment-actions">
              <button @click="toggleLike(comment)" :class="{ liked: comment.isLikedByUser }" class="like-btn">
                👍 {{ comment.likeCount }}
              </button>
              <button v-if="(userRole === 'organizer' || userRole === 'speaker')" @click="togglePin(comment)" class="pin-btn">
                {{ comment.isPinned ? '取消置顶' : '置顶' }}
              </button>
              <button v-if="userRole === 'speaker'" @click="deleteComment(comment)" class="delete-btn">删除</button>
              <button v-else-if="comment.userId === userId || userRole === 'organizer'" @click="deleteComment(comment)" class="delete-btn">删除</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 发表评论表单 -->
      <div class="comment-form-section animate-slide-up-delay">
        <div class="section-header">
          <div class="section-icon">✏️</div>
          <h3 class="section-title">发表观点</h3>
        </div>
        
        <form class="comment-form" @submit.prevent="submitComment">
          <div class="form-group">
            <label class="form-label">💭 您的观点</label>
            <textarea 
              v-model="newComment.text" 
              placeholder="分享您对本次讲座的想法、问题或建议..." 
              required
              class="comment-input"
              rows="4"
            ></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="!newComment.text.trim()">
              <span class="btn-icon">📤</span>
              发表观点
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const lectureId = route.params.id

const comments = ref([])
const loading = ref(true)
const speakerName = '演讲者本人'
const userId = ref(null)
const userRole = ref('')

// 获取评论列表
const fetchComments = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get(`/api/discussion/lecture/${lectureId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.data && res.data.success && res.data.data && res.data.data.messages) {
      comments.value = res.data.data.messages.map(item => ({
        id: item.id,
        userName: item.username,
        text: item.message,
        time: new Date(item.created_at),
        likeCount: item.like_count,
        isLikedByUser: item.isLikedByUser,
        isPinned: item.is_pinned,
        userId: item.user_id,
        userRole: item.user_role
      }))
    } else {
      comments.value = []
    }
  } catch (e) {
    comments.value = []
  }
  loading.value = false
}

const newComment = ref({ text: '' })

const submitComment = async () => {
  if (!newComment.value.text.trim()) return
  try {
    const token = localStorage.getItem('token')
    const res = await axios.post(`/api/discussion/lecture/${lectureId}/message`, {
      message: newComment.value.text
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.data && res.data.success) {
      // 重新拉取评论列表，或可直接push新评论
      await fetchComments()
      newComment.value.text = ''
    }
  } catch (e) {
    // 可加错误提示
  }
}

// 点赞/取消点赞
const toggleLike = async (comment) => {
  try {
    const token = localStorage.getItem('token')
    const res = await axios.post(`/api/discussion/message/${comment.id}/like`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.data && res.data.success) {
      await fetchComments()
    }
  } catch (e) {}
}

// 置顶/取消置顶（仅讲师）
const togglePin = async (comment) => {
  try {
    const token = localStorage.getItem('token')
    const res = await axios.post(`/api/discussion/lecture/${lectureId}/message/${comment.id}/pin`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.data && res.data.success) {
      await fetchComments()
    }
  } catch (e) {}
}

// 删除消息（本人或讲师）
const deleteComment = async (comment) => {
  if (!confirm('确定要删除这条消息吗？')) return
  try {
    const token = localStorage.getItem('token')
    const res = await axios.delete(`/api/discussion/lecture/${lectureId}/message/${comment.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.data && res.data.success) {
      await fetchComments()
    }
  } catch (e) {}
}

// 发送公告（仅讲师）
const announcementText = ref('')
const sendAnnouncement = async () => {
  if (!announcementText.value.trim()) return
  try {
    const token = localStorage.getItem('token')
    const res = await axios.post(`/api/discussion/lecture/${lectureId}/announcement`, {
      message: announcementText.value
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.data && res.data.success) {
      announcementText.value = ''
      await fetchComments()
    }
  } catch (e) {}
}

const formatTime = (time: Date) => {
  const now = new Date()
  const diff = now.getTime() - time.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return time.toLocaleDateString('zh-CN')
}

onMounted(() => {
  // 获取用户信息（假设token中有，或从后端接口获取）
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
  userId.value = userInfo.userId
  userRole.value = userInfo.role
  fetchComments()
})
</script>

<style scoped>
/* 容器样式 */
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

/* 头部区域 */
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

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #10a37f;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(16, 163, 127, 0.2);
  border-top: 3px solid #10a37f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

/* 内容区域 */
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

/* 公告区域 */
.announcement-section {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(16, 163, 127, 0.1);
  margin-bottom: 2rem;
}

.announcement-form {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.announcement-input {
  flex-grow: 1;
  padding: 0.8rem;
  border: 2px solid rgba(16, 163, 127, 0.2);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.announcement-input:focus {
  outline: none;
  border-color: #10a37f;
  box-shadow: 0 0 0 3px rgba(16, 163, 127, 0.1);
}

.announcement-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(16, 163, 127, 0.2);
}

.announcement-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0e8c6b 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 163, 127, 0.3);
}

.announcement-btn:disabled {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 评论区域 */
.comments-section {
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

.comment-card.pinned {
  border-left: 4px solid #10a37f;
  padding-left: 0.8rem;
}

.pinned-badge {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: white;
  padding: 0.1rem 0.5rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.user-badge {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: white;
  padding: 0.1rem 0.5rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
}

.comment-time {
  color: #6b7280;
  font-size: 0.8rem;
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

.like-btn, .pin-btn, .delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.like-btn {
  background: linear-gradient(135deg, #e0f2fe 0%, #d1eefd 100%);
  color: #10a37f;
  border: 1px solid #10a37f;
}

.like-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #cce6ff 0%, #b8e0ff 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(16, 163, 127, 0.1);
}

.like-btn.liked {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: white;
  border: none;
}

.pin-btn {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  color: #d97706;
  border: 1px solid #d97706;
}

.pin-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #fef9c3 0%, #fde68a 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.1);
}

.delete-btn {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 1px solid #991b1b;
}

.delete-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #fca5a5 0%, #f87171 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(153, 27, 27, 0.1);
}

/* 评论表单区域 */
.comment-form-section {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(16, 163, 127, 0.1);
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #10a37f;
  font-size: 0.9rem;
}

.comment-input {
  padding: 0.8rem;
  border: 2px solid rgba(16, 163, 127, 0.2);
  border-radius: 8px;
  font-size: 0.95rem;
  resize: vertical;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.comment-input:focus {
  outline: none;
  border-color: #10a37f;
  box-shadow: 0 0 0 3px rgba(16, 163, 127, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(16, 163, 127, 0.2);
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0e8c6b 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 163, 127, 0.3);
}

.submit-btn:disabled {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-icon {
  font-size: 1rem;
}

/* 动画效果 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

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

.animate-bounce {
  animation: bounce 2s infinite;
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

.animate-fade-in-delay {
  animation: fadeIn 0.8s ease-out 0.3s both;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .discussion-wrapper {
    padding: 1rem;
    margin: 0 0.5rem;
  }
  
  .title-icon {
    font-size: 1.5rem;
  }
  
  .discussion-title {
    font-size: 1.5rem;
  }
  
  .content-section {
    gap: 1.5rem;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .submit-btn {
    width: 100%;
    justify-content: center;
  }

  .announcement-form {
    flex-direction: column;
    align-items: flex-start;
  }

  .announcement-input {
    width: 100%;
  }

  .announcement-btn {
    width: 100%;
    justify-content: center;
  }
}
</style> 