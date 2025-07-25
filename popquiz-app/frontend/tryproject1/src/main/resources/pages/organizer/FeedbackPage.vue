<template>
  <div class="feedback-wrapper">
    <div class="header-section">
      <div class="title-icon animate-bounce">📊</div>
      <h2 class="feedback-title animate-fade-in">听众反馈</h2>
      <p class="subtitle animate-fade-in-delay">收集听众的宝贵意见和建议</p>
    </div>
    <div class="feedback-btn-group">
      <button :class="{active: showSections.typeStats}" @click="showSections.typeStats=!showSections.typeStats">反馈类型统计</button>
      <button :class="{active: showSections.stats}" @click="showSections.stats=!showSections.stats">数量和评分统计</button>
      <button :class="{active: showSections.details}" @click="showSections.details=!showSections.details">详细反馈</button>
    </div>
    <div v-if="showSections.typeStats" class="feedback-stats-section animate-slide-up">
      <!-- 反馈类型统计表格内容（原 typeStats 区块） -->
      <div class="section-header">
        <div class="section-icon">📈</div>
        <h3 class="section-title">反馈类型统计</h3>
      </div>
      <div v-if="stats.length === 0" class="empty-state">
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
            <tr v-for="item in stats" :key="item.feedback_type">
              <td>{{ item.feedbackTypeText || item.feedback_type }}</td>
              <td>{{ item.count }}</td>
              <td>{{ item.percentage ? item.percentage + '%' : ((item.count / (totalCount || 1) * 100).toFixed(2) + '%') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="showSections.stats" class="stats-section animate-slide-up">
      <!-- 数量和评分统计区块 -->
      <div class="section-header">
        <div class="section-icon">📈</div>
        <h3 class="section-title">数量和评分统计</h3>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ statsSummary.total }}</div>
          <div class="stat-label">总反馈数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ statsSummary.positive }}</div>
          <div class="stat-label">正面反馈</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ statsSummary.average }}</div>
          <div class="stat-label">平均评分</div>
        </div>
      </div>
    </div>
    <div v-if="showSections.details" class="feedbacks-section animate-slide-up-delay">
      <!-- 详细反馈区块（原 feedbacks-section 区块内容） -->
      <div class="section-header">
        <div class="section-icon">💬</div>
        <h3 class="section-title">详细反馈</h3>
      </div>
      <div v-if="feedbacks.length === 0" class="empty-state">
        <div class="empty-icon">��</div>
        <h4>暂无反馈内容</h4>
        <p>听众的反馈将在这里展示</p>
      </div>
      <div v-else class="feedback-list">
        <div v-for="fb in feedbacks" :key="fb.id" class="feedback-card animate-slide-in">
          <div class="feedback-header">
            <div class="user-info">
              <span class="user-avatar">👤</span>
              <span class="user-name">{{ fb.username }}</span>
              <span class="feedback-type">{{ fb.feedbackTypeText || fb.feedback_type }}</span>
              <span class="feedback-time">{{ fb.created_at ? (new Date(fb.created_at)).toLocaleString() : '' }}</span>
            </div>
          </div>
          <div class="feedback-body">
            <div v-if="fb.feedback_message">{{ fb.feedback_message }}</div>
            <div v-else class="feedback-no-msg">（无详细留言）</div>
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

const route = useRoute()
const lectureId = route.params.id
const feedbacks = ref<any[]>([])
const loading = ref(true)
const stats = ref<any[]>([])
const totalCount = ref(0)
const showSections = ref<{[key:string]: boolean}>({ typeStats: false, stats: false, details: false })
const statsSummary = ref({ total: 0, positive: 0, average: 0 })

async function fetchStats() {
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get(`/api/feedback/lecture/${lectureId}/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.data && res.data.success && res.data.data && res.data.data.stats) {
      stats.value = res.data.data.stats
      totalCount.value = res.data.data.totalCount || 0
      // 统计区块数据
      const statArr = res.data.data.stats || []
      const total = res.data.data.totalCount || 0
      const positive = statArr.find(s => s.feedback_type === 'good')?.count || 0
      const average = total > 0 ? (positive * 5 / total).toFixed(1) : '0.0'
      statsSummary.value = { total, positive, average }
    } else {
      stats.value = []
      totalCount.value = 0
      statsSummary.value = { total: 0, positive: 0, average: 0 }
    }
  } catch (e) {
    stats.value = []
    totalCount.value = 0
    statsSummary.value = { total: 0, positive: 0, average: 0 }
  }
}

async function fetchFeedbacks() {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get(`/api/feedback/lecture/${lectureId}/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.data && res.data.success && res.data.data && res.data.data.feedbacks) {
      feedbacks.value = res.data.data.feedbacks
    } else {
      feedbacks.value = []
    }
  } catch (e) {
    feedbacks.value = []
  }
  loading.value = false
}

onMounted(() => {
  fetchStats()
  fetchFeedbacks()
})
</script>
<style scoped>
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
  justify-content: flex-start;
  align-items: center;
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
.feedback-body {
  color: #374151;
  line-height: 1.6;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}
.feedback-list-ul {
  padding-left: 18px;
  margin: 0;
}
.feedback-item {
  font-size: 1.05rem;
  color: #2d8c7f;
  margin-bottom: 4px;
}
.feedback-other {
  color: #e53935;
}
.feedback-type {
  background: #e0f2fe;
  color: #059669;
  border-radius: 8px;
  padding: 2px 10px;
  font-size: 0.85rem;
  margin-left: 8px;
  font-weight: 600;
}
.feedback-time {
  margin-left: 10px;
  color: #94a3b8;
  font-size: 0.8rem;
}
.feedback-no-msg {
  color: #bdbdbd;
  font-size: 0.95rem;
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
.stats-section {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(16, 163, 127, 0.1);
  margin-bottom: 2rem;
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
</style>
