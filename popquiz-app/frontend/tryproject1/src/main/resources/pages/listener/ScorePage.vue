<template>
  <div class="score-wrapper">
    <div class="page-header">
      <div class="title-icon animate-bounce">📊</div>
      <h2 class="score-title animate-fade-in">成绩报告</h2>
      <p class="subtitle animate-fade-in-delay">查看答题结果与详细分析</p>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">正在加载成绩数据...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <p class="error-text">{{ error }}</p>
      <button @click="fetchScoreData" class="retry-btn">重试</button>
    </div>

    <div v-else class="score-content">
      <!-- 成绩概览 -->
      <div class="score-overview">
        <div class="stats-grid">
          <div class="stat-card accuracy clickable" @click="showAccuracyModal">
            <div class="stat-icon">🎯</div>
            <div class="stat-number">{{ overallAccuracy }}%</div>
            <div class="stat-label">总体正确率</div>
            <div class="stat-description">{{ totalCorrect }}/{{ totalAnswers }} 题正确</div>
            <div class="click-hint">点击查看详情</div>
          </div>
          <div class="stat-card completion clickable" @click="showCompletionModal">
            <div class="stat-icon">📝</div>
            <div class="stat-number">{{ completionRate }}%</div>
            <div class="stat-label">总体完成率</div>
            <div class="stat-description">{{ answeredQuestions }}/{{ totalQuestions }} 题作答</div>
            <div class="click-hint">点击查看详情</div>
          </div>
          <div class="stat-card performance" :class="getPerformanceClass()">
            <div class="stat-icon">⭐</div>
            <div class="stat-number">{{ getPerformanceLevel() }}</div>
            <div class="stat-label">评价等级</div>
            <div class="stat-description">{{ getPerformanceDesc() }}</div>
          </div>
        </div>
      </div>

      <!-- 分组统计 -->
      <div v-if="false" class="groups-section" style="display: none;">
        <h3 class="section-title">� 分组统计</h3>
        <div class="groups-grid">
          <div v-for="group in groupStats" :key="group.group_id" class="group-card">
            <div class="group-header">
              <div class="group-title">第 {{ group.group_id }} 组</div>
              <div class="group-questions">{{ group.questions_count }} 题</div>
            </div>
            <div class="group-stats">
              <div class="group-stat">
                <span class="stat-value">{{ group.accuracy_rate || 0 }}%</span>
                <span class="stat-label">正确率</span>
              </div>
              <div class="group-stat">
                <span class="stat-value">{{ group.participants_count || 0 }}</span>
                <span class="stat-label">参与人数</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 我的排名 -->
      <div class="my-ranking-section">
        <h3 class="section-title">🏆 我的排名</h3>
        

        
        <div v-if="myRank && myRankInfo" class="my-rank-card">
          <div class="rank-display">
            <div class="rank-number" :class="getRankClass(myRank - 1)">{{ myRank }}</div>
            <div class="rank-info">
              <div class="rank-label">当前排名</div>
              <div class="rank-total">共 {{ leaderboard.length }} 人</div>
            </div>
          </div>
          <div class="rank-stats">
            <div class="rank-stat">
              <span class="stat-value">{{ myRankInfo.accuracy_rate || 0 }}%</span>
              <span class="stat-label">正确率</span>
            </div>
            <div class="rank-stat">
              <span class="stat-value">{{ myRankInfo.total_questions || 0 }}</span>
              <span class="stat-label">答题数</span>
            </div>
          </div>
        </div>
        <div v-else class="no-rank-card">
          <div class="no-rank-icon">📝</div>
          <div class="no-rank-text">暂未参与答题</div>
          <div class="no-rank-desc">完成答题后即可查看排名</div>
        </div>
      </div>

      <!-- 排行榜 -->
      <div v-if="leaderboard.length" class="leaderboard-section">
        <h3 class="section-title">🏆 答题排行榜</h3>
        <div class="leaderboard-list">
          <div v-for="(user, index) in leaderboard.slice(0, 5)" :key="user.user_id || user.id" class="leaderboard-item" :class="{ 'is-me': isCurrentUser(user) }">
            <div class="rank-badge" :class="getRankClass(index)">{{ index + 1 }}</div>
            <div class="user-info">
              <div class="username">{{ user.nickname || user.username }} {{ isCurrentUser(user) ? '(我)' : '' }}</div>
              <div class="user-stats">{{ user.accuracy_rate }}% 正确率 · {{ user.total_questions }}题</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 正确率详情弹窗 -->
    <div v-if="showAccuracyDetails" class="modal-overlay" @click="closeAccuracyModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>📊 个人正确率详情</h3>
          <button class="close-btn" @click="closeAccuracyModal">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-item">
            <div class="detail-label">总体表现</div>
            <div class="detail-value">
              <span class="accuracy-rate">{{ overallAccuracy }}%</span>
              <span class="detail-desc">{{ totalCorrect }}/{{ totalAnswers }} 题正确</span>
            </div>
          </div>
          <div v-if="(myStats.total_questions && Number(myStats.total_questions) > 0) || (Array.isArray(myAnswers) && myAnswers.length > 0)" class="detail-item">
            <div class="detail-label">参与题数</div>
            <div class="detail-value">
              <span class="accuracy-rate">{{ Number(myStats.total_questions) > 0 ? myStats.total_questions : (Array.isArray(myAnswers) ? myAnswers.length : 0) }}</span>
              <span class="detail-desc">共 {{ lectureStats.questions_count }} 题</span>
            </div>
          </div>
          
          <!-- 分组统计信息 -->
          <div v-if="groupStats.length > 0" class="group-stats-section">
            <div class="group-stats-title">📊 各组表现</div>
            <div class="group-stats-list">
              <div v-for="group in groupStats" :key="group.group_id" class="group-stat-item">
                <div class="group-info">
                  <span class="group-name">第 {{ group.group_id }} 组</span>
                  <span class="group-questions">({{ group.questions_count || 0 }} 题)</span>
                </div>
                <div class="group-metrics">
                  <div class="group-metric">
                    <span class="metric-label">正确率:</span>
                    <span class="metric-value">{{ Math.round((group.correct_answers || 0) / Math.max(group.total_answers || 1, 1) * 100) }}%</span>
                  </div>
                  <div class="group-metric">
                    <span class="metric-label">参与:</span>
                    <span class="metric-value">{{ group.participants_count || 0 }}人</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 完成率详情弹窗 -->
    <div v-if="showCompletionDetails" class="modal-overlay" @click="closeCompletionModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>📝 个人完成率详情</h3>
          <button class="close-btn" @click="closeCompletionModal">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-item">
            <div class="detail-label">完成情况</div>
            <div class="detail-value">
              <span class="completion-rate">{{ completionRate }}%</span>
              <span class="detail-desc">{{ Number(myStats.total_questions) > 0 ? myStats.total_questions : (Array.isArray(myAnswers) ? myAnswers.length : 0) }}/{{ totalQuestions }} 题作答</span>
            </div>
          </div>
          <!-- 注释掉平均答题时间计算
          <div v-if="myStats.avg_answer_time_ms" class="detail-item">
            <div class="detail-label">平均答题时间</div>
            <div class="detail-value">
              <span class="completion-rate">{{ Math.round(myStats.avg_answer_time_ms / 1000) }}秒</span>
              <span class="detail-desc">每题平均用时</span>
            </div>
          </div>
          -->
          
          <!-- 分组完成情况 -->
          <div v-if="groupStats.length > 0" class="group-stats-section">
            <div class="group-stats-title">📝 各组完成情况</div>
            <div class="group-stats-list">
              <div v-for="group in groupStats" :key="group.group_id" class="group-stat-item">
                <div class="group-info">
                  <span class="group-name">第 {{ group.group_id }} 组</span>
                  <span class="group-questions">({{ group.questions_count || 0 }} 题)</span>
                </div>
                <div class="group-metrics">
                  <div class="group-metric">
                    <span class="metric-label">完成率:</span>
                    <span class="metric-value">{{ Math.round((group.total_answers || 0) / Math.max((group.questions_count || 1) * (group.participants_count || 1), 1) * 100) }}%</span>
                  </div>
                  <div class="group-metric">
                    <span class="metric-label">参与:</span>
                    <span class="metric-value">{{ group.participants_count || 0 }}人</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { AuthManager } from '../../../../utils/auth'

// 响应式数据
const loading = ref(true)
const error = ref('')
const lectureStats = ref<any>({})
const groupStats = ref<any[]>([])
const leaderboard = ref<any[]>([])
const myAnswers = ref<any[]>([])
const myStats = ref<any>({})
const currentUserId = ref<number | null>(null)

// 弹窗状态
const showAccuracyDetails = ref(false)
const showCompletionDetails = ref(false)

// 计算属性
const overallAccuracy = computed(() => {
  // 优先用myStats
  if (myStats.value && Number(myStats.value.total_questions) > 0) {
    // myStats.accuracy_rate通常为百分比（如87.5），如为小数需*100
    let acc = myStats.value.accuracy_rate
    if (acc > 1 && acc <= 100) return Math.round(acc)
    if (acc > 0 && acc <= 1) return Math.round(acc * 100)
    return 0
  }
  // 兜底用myAnswers
  if (!Array.isArray(myAnswers.value) || myAnswers.value.length === 0) return 0
  const correct = myAnswers.value.filter(answer => answer.is_correct).length
  return Math.round((correct / myAnswers.value.length) * 100)
})

const completionRate = computed(() => {
  const totalQuestionsCount = Number(lectureStats.value.questions_count) || 0
  if (totalQuestionsCount === 0) return 0
  // 优先用myStats
  if (myStats.value && Number(myStats.value.total_questions) > 0) {
    return Math.round((myStats.value.total_questions / totalQuestionsCount) * 100)
  }
  // 兜底用myAnswers
  const answeredQuestionsCount = Array.isArray(myAnswers.value) ? myAnswers.value.length : 0
  return Math.round((answeredQuestionsCount / totalQuestionsCount) * 100)
})

const totalCorrect = computed(() => {
  if (myStats.value && typeof myStats.value.correct_answers !== 'undefined') {
    return Number(myStats.value.correct_answers) || 0
  }
  if (!Array.isArray(myAnswers.value)) return 0
  return myAnswers.value.filter(answer => answer.is_correct).length
})

const totalAnswers = computed(() => {
  if (myStats.value && typeof myStats.value.total_questions !== 'undefined') {
    return Number(myStats.value.total_questions) || 0
  }
  if (!Array.isArray(myAnswers.value)) return 0
  return myAnswers.value.length
})

const answeredQuestions = computed(() => {
  if (myStats.value && typeof myStats.value.total_questions !== 'undefined') {
    return Number(myStats.value.total_questions) || 0
  }
  if (!Array.isArray(myAnswers.value)) return 0
  return myAnswers.value.length
})

const totalQuestions = computed(() => {
  // 只取 lectureStats.value.questions_count
  const count = Number(lectureStats.value?.questions_count)
  if (isNaN(count) || count <= 0) {
    console.log('[ScorePage] totalQuestions 计算异常，lectureStats.value:', lectureStats.value)
  }
  return count > 0 ? count : 0
})

// 获取我在排行榜中的排名
const myRank = computed(() => {
  if (!currentUserId.value || !Array.isArray(leaderboard.value) || leaderboard.value.length === 0) {
    return null
  }
  // 统一字符串比较
  const myIdStr = String(currentUserId.value)
  const index = leaderboard.value.findIndex(user => {
    const userId = user.user_id || user.userId || user.id
    return String(userId) === myIdStr
  })
  return index >= 0 ? index + 1 : null
})

// 获取我的排行榜信息 
const myRankInfo = computed(() => {
  if (!currentUserId.value) {
    return null
  }
  // 优先用myStats
  if (myStats.value && Object.keys(myStats.value).length > 0 && Number(myStats.value.total_questions) > 0) {
    return {
      user_id: currentUserId.value,
      accuracy_rate: myStats.value.accuracy_rate || 0,
      total_questions: myStats.value.total_questions || 0,
      correct_answers: myStats.value.correct_answers || 0
    }
  }
  // 兜底：排行榜查找
  if (Array.isArray(leaderboard.value) && leaderboard.value.length > 0) {
    const myIdStr = String(currentUserId.value)
    const userInLeaderboard = leaderboard.value.find(user => {
      const userId = user.user_id || user.userId || user.id
      return String(userId) === myIdStr
    })
    return userInLeaderboard || null
  }
  return null
})

// 获取当前讲座ID
const getCurrentLectureId = () => {
  return localStorage.getItem('currentLectureId') || sessionStorage.getItem('currentLectureId')
}

// 获取当前用户ID
const getCurrentUserId = () => {
  const token = AuthManager.getToken()
  if (!token) return null
  
  try {
    // 方法1: 从localStorage获取用户信息
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      const userId = user.id || user.userId || user.user_id
      if (userId) return parseInt(userId)
    }
    
    // 方法2: 从token解析（如果是JWT）
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userId = payload.userId || payload.id || payload.user_id || payload.sub
      if (userId) return parseInt(userId)
    } catch (e) {
      // 忽略token解析错误
    }
    
    // 方法3: 从其他可能的存储位置获取
    const storedUserId = localStorage.getItem('userId') || sessionStorage.getItem('userId')
    if (storedUserId) {
      return parseInt(storedUserId)
    }
    
  } catch (e) {
    // 忽略解析错误
  }
  
  return null
}

// 获取成绩数据
const fetchScoreData = async () => {
  const lectureId = getCurrentLectureId()
  console.log('=== ScorePage 调试信息 ===')
  console.log('讲座ID:', lectureId)
  
  if (!lectureId) {
    error.value = '未找到当前讲座信息'
    loading.value = false
    return
  }

  // 检查是否已登录且token有效
  if (!AuthManager.isLoggedIn()) {
    error.value = '登录已过期，请重新登录'
    loading.value = false
    // 可以考虑重定向到登录页面
    // window.location.href = '/login'
    return
  }

  const token = AuthManager.getToken()
  console.log('Token存在:', !!token)
  console.log('Token长度:', token?.length)
  
  if (!token) {
    error.value = '请先登录'
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    // 获取当前用户ID
    currentUserId.value = getCurrentUserId()
    console.log('当前用户ID:', currentUserId.value)

    // 设置请求超时
    const timeout = 10000 // 10秒超时
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const headers = { 'Authorization': `Bearer ${token}` }
    console.log('请求头:', headers)

    // 构建API URLs
    const statsUrl = `/api/answers/lecture/${lectureId}/stats`
    const leaderboardUrl = `/api/answers/lecture/${lectureId}/leaderboard?limit=100`
    const myAnswersUrl = `/api/answers/lecture/${lectureId}/my-answers`
    
    console.log('API URLs:', { statsUrl, leaderboardUrl, myAnswersUrl })

    // 并行获取数据
    const [statsResponse, leaderboardResponse, myAnswersResponse] = await Promise.all([
      // 获取讲座统计
      fetch(statsUrl, {
        headers,
        signal: controller.signal
      }).catch(err => {
        console.error('Stats API网络错误:', err)
        return { ok: false, status: 'network_error', error: err }
      }),
      // 获取完整排行榜（用于确定排名）
      fetch(leaderboardUrl, {
        headers,
        signal: controller.signal
      }).catch(err => {
        console.error('Leaderboard API网络错误:', err)
        return { ok: false, status: 'network_error', error: err }
      }),
      // 获取我的答题记录
      fetch(myAnswersUrl, {
        headers,
        signal: controller.signal
      }).catch(err => {
        console.error('My answers API网络错误:', err)
        return { ok: false, status: 'network_error', error: err }
      })
    ])

    clearTimeout(timeoutId)
    console.log('API响应状态:', {
      stats: statsResponse.ok ? 'OK' : `错误 ${statsResponse.status}`,
      leaderboard: leaderboardResponse.ok ? 'OK' : `错误 ${leaderboardResponse.status}`,
      myAnswers: myAnswersResponse.ok ? 'OK' : `错误 ${myAnswersResponse.status}`
    })

    // 检查是否有401错误（token过期）
    const hasAuthError = [statsResponse, leaderboardResponse, myAnswersResponse].some(
      resp => resp.status === 401 || resp.status === 403
    )
    
    if (hasAuthError) {
      console.warn('检测到认证错误，清除认证信息')
      AuthManager.clearAuth()
      error.value = '登录已过期，请重新登录'
      loading.value = false
      return
    }

    // 处理统计数据
    if (statsResponse.ok && 'json' in statsResponse) {
      try {
        const statsData = await statsResponse.json()
        console.log('Stats数据:', statsData)
        if (statsData.success) {
          lectureStats.value = statsData.data.lectureStats
          groupStats.value = statsData.data.groupStats || []
          console.log('[ScorePage] 赋值后 lectureStats.value:', lectureStats.value)
        }
      } catch (parseError) {
        console.error('Stats数据解析失败:', parseError)
      }
    } else {
      console.warn('Stats API失败:', statsResponse)
    }

    // 处理排行榜数据
    if (leaderboardResponse.ok && 'json' in leaderboardResponse) {
      try {
        const leaderboardData = await leaderboardResponse.json()
        console.log('Leaderboard数据:', leaderboardData)
        if (leaderboardData.success) {
          leaderboard.value = leaderboardData.data || []
        }
      } catch (parseError) {
        console.error('Leaderboard数据解析失败:', parseError)
      }
    } else {
      console.warn('Leaderboard API失败:', leaderboardResponse)
    }

    // 处理个人答题数据
    if (myAnswersResponse.ok && 'json' in myAnswersResponse) {
      try {
        const myAnswersData = await myAnswersResponse.json()
        console.log('My answers数据:', myAnswersData)
        if (myAnswersData.success) {
          myAnswers.value = myAnswersData.data.answers || []
          myStats.value = myAnswersData.data.stats || {}
        }
      } catch (parseError) {
        console.error('My answers数据解析失败:', parseError)
      }
    } else {
      console.warn('My answers API失败:', myAnswersResponse)
    }

    // 如果所有API都失败了，显示错误
    if (!statsResponse.ok && !leaderboardResponse.ok && !myAnswersResponse.ok) {
      error.value = '无法获取数据，请检查网络连接或稍后重试'
      console.error('所有API都失败了')
    }

  } catch (err: any) {
    console.error('fetchScoreData异常:', err)
    if (err.name === 'AbortError') {
      error.value = '请求超时，请稍后重试'
    } else {
      error.value = err.message || '获取数据失败，请稍后重试'
    }
    console.log('=== ScorePage 数据调试 ===')
    console.log('lectureStats:', lectureStats.value)
    console.log('myStats:', myStats.value)
    console.log('myAnswers:', myAnswers.value)
    console.log('计算结果:')
    console.log('- overallAccuracy:', overallAccuracy.value)
    console.log('- completionRate:', completionRate.value)
    console.log('- totalCorrect:', totalCorrect.value)
    console.log('- totalAnswers:', totalAnswers.value)
    console.log('- answeredQuestions:', answeredQuestions.value)
    console.log('- totalQuestions:', totalQuestions.value)

  } finally {
    loading.value = false
    console.log('=== fetchScoreData 完成 ===')
  }
}

// 弹窗控制
const showAccuracyModal = () => {
  showAccuracyDetails.value = true
}

const closeAccuracyModal = () => {
  showAccuracyDetails.value = false
}

const showCompletionModal = () => {
  showCompletionDetails.value = true
}

const closeCompletionModal = () => {
  showCompletionDetails.value = false
}

// 获取表现等级样式
const getPerformanceClass = () => {
  const acc = overallAccuracy.value
  if (acc >= 90) return 'excellent'
  if (acc >= 80) return 'good'
  if (acc >= 60) return 'fair'
  return 'poor'
}

// 获取表现等级
const getPerformanceLevel = () => {
  const acc = overallAccuracy.value
  if (acc >= 90) return 'A'
  if (acc >= 80) return 'B'
  if (acc >= 60) return 'C'
  return 'D'
}

// 获取表现描述
const getPerformanceDesc = () => {
  const acc = overallAccuracy.value
  if (acc >= 90) return '优秀'
  if (acc >= 80) return '良好'
  if (acc >= 70) return '及格'
  return '需改进'
}

// 获取排名样式
const getRankClass = (index: number) => {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return 'rank-normal'
}

// 判断是否是当前用户
const isCurrentUser = (user: any) => {
  if (!currentUserId.value) return false
  const userId = user.user_id || user.userId || user.id
  return parseInt(userId) === parseInt(String(currentUserId.value || '0'))
}

// 强制停止加载（用于紧急情况）
const forceStopLoading = () => {
  loading.value = false
}

// 组件挂载时获取数据
onMounted(() => {
  fetchScoreData()
})
</script>

<style scoped>
.score-wrapper {
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

.score-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #10a37f 0%, #059669 50%, #047857 100%);
  z-index: 1;
}

.page-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.title-icon {
  font-size: 1.8rem;
  margin-bottom: 0.8rem;
  filter: drop-shadow(0 3px 6px rgba(16, 163, 127, 0.2));
}

.score-title {
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

/* 加载和错误状态 */
.loading-container {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #10a37f;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #6b7280;
  font-size: 1rem;
}

.error-container {
  text-align: center;
  padding: 3rem;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-text {
  color: #ef4444;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.retry-btn {
  background: #10a37f;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background: #059669;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.score-overview {
  margin-bottom: 2.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(16, 163, 127, 0.1);
  transition: transform 0.3s ease;
  position: relative;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.clickable:hover {
  box-shadow: 0 6px 25px rgba(16, 163, 127, 0.15);
}

.click-hint {
  font-size: 0.7rem;
  color: #059669;
  margin-top: 0.5rem;
  opacity: 0.8;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #047857;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.stat-description {
  font-size: 0.8rem;
  color: #6b7280;
}

.stat-card.accuracy .stat-number {
  color: #059669;
}

.stat-card.completion .stat-number {
  color: #10a37f;
}

.stat-card.performance.excellent .stat-number {
  color: #059669;
}

.stat-card.performance.good .stat-number {
  color: #10a37f;
}

.stat-card.performance.fair .stat-number {
  color: #f59e0b;
}

.stat-card.performance.poor .stat-number {
  color: #ef4444;
}

/* 分组统计 */
.groups-section {
  margin-bottom: 2.5rem;
}

/* 我的排名 */
.my-ranking-section {
  margin-bottom: 2.5rem;
}

.my-rank-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(16, 163, 127, 0.1);
  display: flex;
  align-items: center;
  gap: 2rem;
}

.rank-display {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rank-number {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.5rem;
  color: white;
}

.rank-number.rank-gold {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4);
}

.rank-number.rank-silver {
  background: linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%);
  box-shadow: 0 4px 15px rgba(156, 163, 175, 0.4);
}

.rank-number.rank-bronze {
  background: linear-gradient(135deg, #d97706 0%, #92400e 100%);
  box-shadow: 0 4px 15px rgba(217, 119, 6, 0.4);
}

.rank-number.rank-normal {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  box-shadow: 0 4px 15px rgba(16, 163, 127, 0.4);
}

.rank-info {
  text-align: left;
}

.rank-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #10a37f;
  margin-bottom: 0.2rem;
}

.rank-total {
  font-size: 0.9rem;
  color: #6b7280;
}

.rank-stats {
  display: flex;
  gap: 2rem;
  margin-left: auto;
}

.rank-stat {
  text-align: center;
}

.rank-stat .stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 0.2rem;
}

.rank-stat .stat-label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.no-rank-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(16, 163, 127, 0.1);
  text-align: center;
}

.no-rank-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.no-rank-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.no-rank-desc {
  font-size: 0.9rem;
  color: #9ca3af;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #10a37f;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.group-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 10px rgba(16, 163, 127, 0.08);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.group-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #10a37f;
}

.group-questions {
  font-size: 0.9rem;
  color: #6b7280;
  background: rgba(16, 163, 127, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
}

.group-stats {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}

.group-stat {
  text-align: center;
}

.group-stat .stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 0.2rem;
}

.group-stat .stat-label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

/* 排行榜 */
.leaderboard-section {
  margin-bottom: 2rem;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 10px rgba(16, 163, 127, 0.08);
  transition: all 0.3s ease;
}

.leaderboard-item.is-me {
  background: rgba(16, 163, 127, 0.1);
  border: 2px solid rgba(16, 163, 127, 0.3);
  box-shadow: 0 4px 20px rgba(16, 163, 127, 0.15);
  transform: scale(1.02);
}

.leaderboard-item.is-me .username {
  color: #10a37f;
  font-weight: 700;
}

.leaderboard-item.is-me .user-stats {
  color: #047857;
}

.rank-badge {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: white;
}

.rank-badge.rank-gold {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}

.rank-badge.rank-silver {
  background: linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%);
}

.rank-badge.rank-bronze {
  background: linear-gradient(135deg, #d97706 0%, #92400e 100%);
}

.rank-badge.rank-normal {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
}

.user-info {
  flex: 1;
}

.username {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.2rem;
}

.user-stats {
  font-size: 0.8rem;
  color: #6b7280;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #10a37f;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.modal-body {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(16, 163, 127, 0.05);
  border-radius: 8px;
  margin-bottom: 0.8rem;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: 600;
  color: #374151;
}

.detail-value {
  text-align: right;
}

.accuracy-rate,
.completion-rate {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 0.2rem;
}

.detail-desc {
  font-size: 0.8rem;
  color: #6b7280;
}

/* 分组统计弹窗样式 */
.group-stats-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.group-stats-title {
  font-size: 1rem;
  font-weight: 600;
  color: #10a37f;
  margin-bottom: 1rem;
  text-align: center;
}

.group-stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.group-stat-item {
  background: rgba(16, 163, 127, 0.05);
  border-radius: 8px;
  padding: 0.8rem;
  border: 1px solid rgba(16, 163, 127, 0.1);
}

.group-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.group-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.group-questions {
  font-size: 0.8rem;
  color: #6b7280;
  background: rgba(16, 163, 127, 0.1);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.group-metrics {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.group-metric {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.metric-label {
  font-size: 0.8rem;
  color: #6b7280;
}

.metric-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #059669;
}

/* 动画效果 */
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
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-fade-in-delay {
  animation: fadeIn 0.6s ease-out 0.2s both;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .score-wrapper {
    padding: 1rem;
    margin: 0.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .groups-grid {
    grid-template-columns: 1fr;
  }
  
  .group-stats {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .my-rank-card {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .rank-display {
    justify-content: center;
  }
  
  .rank-stats {
    margin-left: 0;
    justify-content: center;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .detail-item {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .detail-value {
    text-align: center;
  }
  
  /* 移动端分组统计样式调整 */
  .group-metrics {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .group-metric {
    justify-content: space-between;
  }
}
</style>