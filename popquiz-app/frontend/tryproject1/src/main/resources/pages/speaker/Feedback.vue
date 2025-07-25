<template>
  <div class="feedback-wrapper">
    <div class="header-section">
      <div class="title-icon animate-bounce">📊</div>
      <h2 class="feedback-title animate-fade-in">听众反馈</h2>
      <p class="subtitle animate-fade-in-delay">收集听众的宝贵意见和建议</p>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载反馈内容...</p>
    </div>
    
    <div v-else class="content-section">
      <div class="feedback-btn-group">
        <button :class="{active: showSections.typeStats}" @click="showSections.typeStats=!showSections.typeStats">反馈类型统计</button>
        <button :class="{active: showSections.stats}" @click="showSections.stats=!showSections.stats">反馈统计</button>
        <button :class="{active: showSections.details}" @click="showSections.details=!showSections.details">详细反馈</button>
      </div>
      <div v-if="showSections.typeStats" class="feedback-stats-section animate-slide-up">
        <!-- 反馈类型统计表格内容（原 typeStats 区块） -->
        <div class="section-header">
          <div class="section-icon">📈</div>
          <h3 class="section-title">反馈类型统计</h3>
        </div>
        <div v-if="typeStats.length === 0" class="empty-state">
          <div class="empty-icon">📊</div>
          <h4>暂无反馈统计</h4>
          <p>暂无数据</p>
        </div>
        <div v-else class="stats-chart">
          <table class="stats-table">
            <thead>
              <tr>
                <th>类型</th>
                <th>数量</th>
                <th>占比</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in typeStats" :key="item.feedback_type">
                <td>{{ item.feedbackTypeText || item.feedback_type }}</td>
                <td>{{ item.count }}</td>
                <td>{{ item.percentage ? item.percentage + '%' : ((item.count / (totalCount || 1) * 100).toFixed(2) + '%') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="showSections.stats" class="stats-section animate-slide-up">
        <!-- 原 stats-section 区块内容 -->
        <div class="section-header">
          <div class="section-icon">📈</div>
          <h3 class="section-title">数量和评分统计</h3>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">总反馈数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.positive }}</div>
            <div class="stat-label">正面反馈</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.average }}</div>
            <div class="stat-label">平均评分</div>
          </div>
        </div>
      </div>
      <div v-if="showSections.details" class="feedbacks-section animate-slide-up-delay">
        <!-- 原 feedbacks-section 区块内容 -->
        <div class="section-header">
          <div class="section-icon">💬</div>
          <h3 class="section-title">详细反馈</h3>
        </div>
        <div v-if="feedbacks.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <h4>暂无反馈内容</h4>
          <p>听众的反馈将在这里显示</p>
        </div>
        <div v-else class="feedback-list">
          <div v-for="feedback in feedbacks" :key="feedback.id" class="feedback-card animate-slide-in">
            <div class="feedback-header">
              <div class="user-info">
                <span class="user-avatar">👤</span>
                <span class="user-name">{{ feedback.userName }}</span>
                <div class="rating-stars">
                  <span v-for="star in 5" :key="star" 
                        class="star" 
                        :class="{ active: star <= feedback.rating }">⭐</span>
                </div>
              </div>
              <div class="feedback-meta">
                <span class="feedback-type" :class="getFeedbackTypeClass(feedback.type)">
                  {{ getFeedbackTypeText(feedback.type) }}
                </span>
                <span class="feedback-time">{{ formatTime(feedback.time) }}</span>
              </div>
            </div>
            <div class="feedback-body">{{ feedback.text }}</div>
            <div class="feedback-tags" v-if="feedback.tags && feedback.tags.length > 0">
              <span v-for="tag in feedback.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

interface Feedback {
  id: string | number
  userName: string
  text: string
  rating: number
  type: string
  time: Date
  tags: string[]
}

interface Stats {
  total: number
  positive: number
  average: number
}

const route = useRoute()
const lectureId = route.params.id

const feedbacks = ref<Feedback[]>([])
const stats = ref<Stats>({ total: 0, positive: 0, average: 0 })
const loading = ref(true)
const typeStats = ref<any[]>([])
const totalCount = ref(0)
const showSections = ref<{[key:string]: boolean}>({ typeStats: false, stats: false, details: false })

const fetchFeedbacks = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    console.log('获取反馈列表 - 讲座ID:', lectureId)
    console.log('Token存在:', !!token)
    console.log('Token来源:', localStorage.getItem('token') ? 'localStorage' : 'sessionStorage')
    
    // 获取反馈列表
    const res = await axios.get(`/api/feedback/lecture/${lectureId}/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    console.log('反馈API响应:', res.data)
    
    if (res.data && res.data.success && res.data.data && res.data.data.feedbacks) {
      feedbacks.value = res.data.data.feedbacks.map(item => ({
        id: item.id,
        userName: item.username,
        text: item.feedback_message,
        rating: 5, // 后端无评分，前端可自定义或忽略
        type: item.feedback_type,
        time: new Date(item.created_at),
        tags: [] // 后端无tags
      }))
      console.log('处理后的反馈数据:', feedbacks.value)
    } else {
      feedbacks.value = []
      console.log('未获取到反馈数据或格式不正确')
    }
  } catch (e) {
    console.error('获取反馈失败:', e)
    console.error('错误详情:', e.response?.data)
    feedbacks.value = []
  }
  loading.value = false
}

const fetchStats = async () => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    console.log('获取反馈统计 - 讲座ID:', lectureId)
    
    const res = await axios.get(`/api/feedback/lecture/${lectureId}/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    console.log('统计API响应:', res.data)
    
    if (res.data && res.data.success && res.data.data) {
      const statArr = res.data.data.stats || []
      const total = res.data.data.totalCount || 0
      const positive = statArr.find(s => s.feedback_type === 'good')?.count || 0
      const average = total > 0 ? parseFloat((positive * 5 / total).toFixed(1)) : 0
      stats.value = { total, positive, average }
      // 修复：赋值类型统计数据
      typeStats.value = statArr
      totalCount.value = total
      console.log('处理后的统计数据:', stats.value)
    } else {
      stats.value = { total: 0, positive: 0, average: 0 }
      typeStats.value = []
      totalCount.value = 0
      console.log('未获取到统计数据或格式不正确')
    }
  } catch (e) {
    console.error('获取统计失败:', e)
    console.error('错误详情:', e.response?.data)
    stats.value = { total: 0, positive: 0, average: 0 }
    typeStats.value = []
    totalCount.value = 0
  }
}

const getPositiveFeedbackCount = () => stats.value.positive
const getAverageRating = () => stats.value.average

const getFeedbackTypeClass = (type: string) => {
  switch (type) {
    case 'positive': return 'type-positive'
    case 'suggestion': return 'type-suggestion'
    case 'negative': return 'type-negative'
    default: return 'type-neutral'
  }
}

const getFeedbackTypeText = (type: string) => {
  switch (type) {
    case 'positive': return '👍 好评'
    case 'suggestion': return '💡 建议'
    case 'negative': return '👎 差评'
    default: return '💬 反馈'
  }
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
  fetchFeedbacks()
  fetchStats()
  loading.value = false
})
</script>

<style scoped>
/* 容器样式 */
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

/* 统计区域 */
.stats-section {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(16, 163, 127, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  padding: 1.2rem;
  border-radius: 10px;
  text-align: center;
  color: white;
  box-shadow: 0 3px 12px rgba(16, 163, 127, 0.2);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.9;
}

/* 反馈区域 */
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
  justify-content: space-between;
  align-items: flex-start;
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

.rating-stars {
  display: flex;
  gap: 0.1rem;
}

.star {
  font-size: 0.9rem;
  opacity: 0.3;
  transition: opacity 0.2s ease;
}

.star.active {
  opacity: 1;
}

.feedback-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
}

.feedback-type {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.type-positive {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.type-suggestion {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.type-negative {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.type-neutral {
  background: rgba(156, 163, 175, 0.1);
  color: #6b7280;
}

.feedback-time {
  color: #6b7280;
  font-size: 0.8rem;
}

.feedback-body {
  color: #374151;
  line-height: 1.6;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.feedback-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: rgba(16, 163, 127, 0.1);
  color: #047857;
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(16, 163, 127, 0.2);
}

.feedback-stats-section {
  background: rgba(255,255,255,0.8);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(16, 163, 127, 0.1);
  margin-bottom: 2rem;
}
.stats-chart {
  margin-top: 1rem;
}
.stats-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(16,163,127,0.07);
}
.stats-table th, .stats-table td {
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}
.stats-table th {
  background: #f0fdf4;
  color: #059669;
  font-weight: 700;
}
.stats-table tr:last-child td {
  border-bottom: none;
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
  .feedback-wrapper {
    padding: 1rem;
    margin: 0 0.5rem;
  }
  
  .title-icon {
    font-size: 1.5rem;
  }
  
  .feedback-title {
    font-size: 1.5rem;
  }
  
  .content-section {
    gap: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .feedback-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
  
  .feedback-meta {
    align-items: flex-start;
  }
  
  .user-info {
    flex-wrap: wrap;
  }
}
.feedback-btn-group {
  display: flex;
  gap: 1.2rem;
  justify-content: center;
  margin-bottom: 2rem;
}
.feedback-btn-group button {
  background: #f0fdf4;
  color: #059669;
  border: 1.5px solid #10a37f;
  border-radius: 8px;
  padding: 0.6rem 1.6rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, color 0.18s, border 0.18s;
}
.feedback-btn-group button.active, .feedback-btn-group button:hover {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: #fff;
  border: 1.5px solid #059669;
}
</style> 