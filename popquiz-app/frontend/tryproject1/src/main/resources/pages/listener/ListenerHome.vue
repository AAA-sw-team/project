<template>
  <div class="center-container">
    <div class="speaker-home-bg">
      <div class="speaker-home">
        <!-- 头部标题区域 -->
        <div class="header-section">
          <div class="title-icon">👥</div>
          <h2 class="speaker-title">听众中心</h2>
          <p class="subtitle">参与讲座，互动学习</p>
        </div>

        <!-- 操作按钮组 -->
        <div class="action-buttons">
          <button class="create-btn primary" @click="showCreate = true">
            <span class="btn-icon">🚀</span>
            <span>加入讲座</span>
          </button>
          <button class="create-btn secondary" @click="toggleLectures">
            <span class="btn-icon">📚</span>
            <span>{{ showLectures ? '隐藏讲座' : '已有讲座' }}</span>
          </button>
        </div>

        <!-- 讲座列表 -->
        <div v-if="showLectures" class="lecture-list">
          <div class="list-header">
            <h3>我的讲座</h3>
            <span class="lecture-count">{{ myLectures.length }} 个讲座</span>
          </div>
          
          <div v-if="myLectures.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <p>暂未参与任何讲座</p>
            <span>点击"加入讲座"开始参与吧</span>
          </div>
          
          <div v-else class="lectures-grid">
            <div v-for="lecture in myLectures" :key="lecture.id" class="lecture-card">
              <div class="card-header">
                <div class="status-badge" :class="getStatusClass(lecture.status)">
                  {{ getStatusText(lecture.status) }}
                </div>
                <div class="action-buttons-header">
                  <div class="lecture-id">ID: {{ lecture.id }}</div>
                  <!-- 只有当用户已退出讲座（left状态）且讲座未结束时，才显示重新进入图标 -->
                  <div v-if="lecture.participant_status === 'left' && lecture.status !== 2" class="reenter-icon" title="重新进入讲座" @click.stop="rejoinLecture(lecture)">
                    🔄
                  </div>
                </div>
              </div>
              
              <div class="card-content" @click="viewLectureInfo(lecture)">
                <div class="lecture-title">{{ lecture.title }}</div>
                <div class="lecture-desc">{{ lecture.desc || '暂无简介' }}</div>
                <div class="lecture-meta">
                  <div class="lecture-speaker">
                    <span class="icon">👤</span>
                    {{ lecture.speaker }}
                  </div>
                </div>
              </div>
              
              <div class="card-footer">
                <span class="manage-text">点击查看详情</span>
                <span class="arrow">→</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 创建讲座模态框 -->
        <div v-if="showCreate" class="modal-bg" @click.self="showCreate = false">
          <div class="modal">
            <div class="modal-header">
              <h3>🚀 加入讲座</h3>
              <button class="close-btn" @click="showCreate = false">✕</button>
            </div>
            
            <div class="modal-body">
              <div class="input-group">
                <label>讲座ID</label>
                <input 
                  v-model="lectureId" 
                  type="text" 
                  placeholder="请输入6位讲座ID" 
                  maxlength="6"
                  @keyup.enter="joinLecture"
                  :disabled="isJoining"
                />
              </div>
            </div>
            
            <div class="modal-actions">
              <button class="btn-cancel" @click="showCreate = false">取消</button>
              <button 
                class="btn-create" 
                @click="joinLecture"
                :disabled="!lectureId.trim() || isJoining"
              >
                <span v-if="isJoining" class="loading-spinner"></span>
                <span v-else>{{ isJoining ? '加入中...' : '加入讲座' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 消息提示 -->
        <div v-if="message.show" class="message" :class="message.type">
          <span class="message-icon">{{ message.type === 'success' ? '✅' : '❌' }}</span>
          <span>{{ message.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式数据
const lectureId = ref('')
const isJoining = ref(false)
const showLectures = ref(false)
const showCreate = ref(false)
const myLectures = ref<{id: number, title: string, desc: string, speaker: string, status: number, participant_status: string}[]>([])
const message = ref({
  show: false,
  type: 'success' as 'success' | 'error',
  text: ''
})

// 状态处理函数
const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '未开始'
    case 1: return '进行中'
    case 2: return '已结束'
    default: return '未知'
  }
}

const getStatusClass = (status: number) => {
  switch (status) {
    case 0: return 'status-created'
    case 1: return 'status-teaching'
    case 2: return 'status-ended'
    default: return 'status-unknown'
  }
}

// 显示消息
const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
  message.value = { show: true, type, text }
  setTimeout(() => {
    message.value.show = false
  }, 3000)
}

// 加入讲座
const joinLecture = async () => {
  if (!lectureId.value.trim()) {
    showMessage('请输入讲座ID', 'error')
    return
  }

  if (!/^\d{6}$/.test(lectureId.value.trim())) {
    showMessage('讲座ID必须是6位数字', 'error')
    return
  }

  isJoining.value = true
  
  try {
    const token = sessionStorage.getItem('token')
    if (!token) {
      showMessage('请先登录', 'error')
      router.push('/login')
      return
    }

    // 1. 首先检查用户是否有未离开的讲座
    const myLecturesResponse = await fetch('/api/participants/my-lectures', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (myLecturesResponse.ok) {
      const myLecturesData = await myLecturesResponse.json()
      // 查找状态为joined且讲座未结束的讲座
      const activeJoinedLecture = myLecturesData.find((lecture: any) => 
        lecture.participant_status === 'joined' && lecture.status !== 2
      )
      
      if (activeJoinedLecture) {
        showMessage(`您正在参与"${activeJoinedLecture.title}"讲座，请先离开此讲座才能加入其他讲座`, 'error')
        return
      }
    }

    // 2. 检查目标讲座是否存在
    const lectureResponse = await fetch(`/api/lectures/${lectureId.value}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!lectureResponse.ok) {
      if (lectureResponse.status === 404) {
        showMessage('讲座不存在，请检查ID是否正确', 'error')
      } else {
        showMessage('获取讲座信息失败', 'error')
      }
      return
    }

    const lectureData = await lectureResponse.json()

    // 3. 检查用户是否已经加入过这个讲座
    const checkHistoryResponse = await fetch(`/api/participants/check-history/${lectureId.value}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    let hasJoinedBefore = false
    if (checkHistoryResponse.ok) {
      const checkData = await checkHistoryResponse.json()
      hasJoinedBefore = checkData.hasJoined
    }

    // 4. 根据不同情况处理
    if (hasJoinedBefore) {
      // 用户已经加入过这个讲座
      if (lectureData.status === 2) {
        // 讲座已结束
        showMessage('您已参与过此讲座，讲座已结束。请点击"已有讲座"中的相应讲座查看统计数据', 'error')
      } else {
        // 讲座未结束
        showMessage('您已参与过此讲座。请点击"已有讲座"中的相应讲座重新进入', 'error')
      }
      return
    }

    // 5. 用户未加入过，检查讲座状态
    if (lectureData.status === 2) {
      // 讲座已结束，未加入过的用户不能加入
      showMessage('讲座已结束，无法加入', 'error')
      return
    }

    if (lectureData.status === 0) {
      // 讲座未开始
      showMessage('讲座尚未开始，请稍后再试', 'error')
      return
    }

    // 6. 讲座进行中且用户未加入过，可以加入
    const joinResponse = await fetch(`/api/participants/join/${lectureId.value}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!joinResponse.ok) {
      const errorData = await joinResponse.json()
      showMessage(errorData.message || '加入讲座失败', 'error')
      return
    }

    // 成功加入讲座
    showMessage('成功加入讲座！', 'success')
    showCreate.value = false
    
    // 刷新讲座列表以显示新加入的讲座
    if (showLectures.value) {
      await fetchMyLectures()
    }
    
    setTimeout(() => {
      router.push(`/listener/lecture/${lectureId.value}/quiz`)
    }, 1000)

  } catch (error) {
    console.error('加入讲座错误:', error)
    showMessage('网络错误，请稍后重试', 'error')
  } finally {
    isJoining.value = false
  }
}

// 切换我的讲座显示
const toggleLectures = () => {
  showLectures.value = !showLectures.value
  if (showLectures.value && myLectures.value.length === 0) {
    fetchMyLectures()
  }
}

// 获取我的讲座
const fetchMyLectures = async () => {
  try {
    const token = sessionStorage.getItem('token')
    if (!token) return

    const response = await fetch('/api/participants/my-lectures', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      myLectures.value = data
    }
  } catch (error) {
    console.error('获取讲座列表失败:', error)
  }
}

// 重新进入讲座（仅适用于未结束的讲座）
const rejoinLecture = async (lecture: any) => {
  if (lecture.status === 2) {
    showMessage('讲座已结束，无法重新进入', 'error')
    return
  }

  try {
    const token = sessionStorage.getItem('token')
    if (!token) {
      showMessage('请先登录', 'error')
      router.push('/login')
      return
    }

    const joinResponse = await fetch(`/api/participants/join/${lecture.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!joinResponse.ok) {
      const errorData = await joinResponse.json()
      showMessage(errorData.message || '重新加入讲座失败', 'error')
      return
    }

    showMessage('成功重新加入讲座！', 'success')
    
    // 更新本地状态
    lecture.participant_status = 'joined'
    
    // 刷新讲座列表以确保状态同步
    await fetchMyLectures()
    
    // 根据讲座状态跳转
    if (lecture.status === 1) {
      // 讲座进行中，跳转到答题页面
      router.push(`/listener/lecture/${lecture.id}/quiz`)
    } else {
      showMessage('讲座尚未开始', 'error')
    }
  } catch (error) {
    console.error('重新加入讲座错误:', error)
    showMessage('网络错误，请稍后重试', 'error')
  }
}

// 查看讲座信息
const viewLectureInfo = (lecture: any) => {
  // 如果用户状态为joined且讲座进行中，跳转到答题页面
  if (lecture.participant_status === 'joined' && lecture.status === 1) {
    // 用户已加入且讲座进行中，跳转到答题页面
    router.push(`/listener/lecture/${lecture.id}/quiz`)
  } else if (lecture.status === 2) {
    // 讲座已结束，跳转到统计页面
    router.push(`/listener/lecture/${lecture.id}/score`)
  } else if (lecture.status === 1) {
    // 讲座进行中但用户已退出，跳转到统计页面查看信息（不能答题）
    router.push(`/listener/lecture/${lecture.id}/score`)
  } else if (lecture.status === 0) {
    showMessage('讲座尚未开始，暂无可查看内容', 'error')
  }
}

// 进入讲座（保持原有逻辑兼容性）
const enterLecture = async (lecture: any) => {
  // 如果用户已退出讲座且讲座未结束，需要先重新加入
  if (lecture.participant_status === 'left' && lecture.status !== 2) {
    await rejoinLecture(lecture)
  } else {
    // 其他情况直接查看信息
    viewLectureInfo(lecture)
  }
}

onMounted(() => {
  // 页面加载时可以自动获取历史讲座
})
</script>
<style scoped>
/* 中心容器 */
.center-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-height: 100vh;
  padding: 0;
  margin: 0;
}

.speaker-home-bg {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  padding: 2rem 1rem;
  box-sizing: border-box;
  position: relative;
}

.speaker-home-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(16, 163, 127, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(5, 150, 105, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(4, 120, 87, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.speaker-home {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 900px;
  min-height: 500px;
  box-shadow: 
    0 25px 60px rgba(0, 0, 0, 0.08),
    0 10px 30px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 1;
}

.speaker-home::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #10a37f 0%, #059669 50%, #047857 100%);
  border-radius: 24px 24px 0 0;
}

/* 头部区域 */
.header-section {
  text-align: center;
  margin-bottom: 2.5rem;
  width: 100%;
}

.title-icon {
  font-size: 3.5rem;
  margin-bottom: 1.2rem;
  filter: drop-shadow(0 4px 12px rgba(16, 163, 127, 0.3));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.speaker-title {
  font-size: 2.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.8rem 0;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(16, 163, 127, 0.1);
}

.subtitle {
  font-size: 1.2rem;
  color: #047857;
  margin: 0;
  font-weight: 500;
  opacity: 0.8;
}

/* 操作按钮组 */
.action-buttons {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.2rem 2.5rem;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-width: 200px;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.create-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.create-btn:hover::before {
  left: 100%;
}

.create-btn.primary {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: white;
  box-shadow: 0 8px 25px rgba(16, 163, 127, 0.3);
}

.create-btn.secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #10a37f;
  border: 2px solid #10a37f;
  backdrop-filter: blur(10px);
}

.create-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(16, 163, 127, 0.4);
}

.create-btn.secondary:hover {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: white;
  border-color: transparent;
}

.btn-icon {
  font-size: 1.2rem;
}

/* 讲座列表 */
.lecture-list {
  width: 100%;
  margin-top: 1rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
}

.list-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.lecture-count {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(71, 85, 105, 0.15);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.6;
  filter: grayscale(20%);
}

.empty-state p {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 0.8rem 0;
  color: #475569;
}

.empty-state span {
  font-size: 1rem;
  opacity: 0.7;
}

.lectures-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  width: 100%;
  padding: 0 1rem;
}

.lecture-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  padding: 0.8rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.lecture-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
}

.lecture-card:hover {
  transform: translateY(-8px);
  border-color: rgba(16, 163, 127, 0.3);
  box-shadow: 0 20px 50px rgba(16, 163, 127, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.status-badge {
  color: white;
  padding: 0.25rem 0.6rem;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.status-created {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}

.status-teaching {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.status-ended {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.status-unknown {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
}

.action-buttons-header {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.lecture-id {
  font-size: 0.75rem;
  color: #047857;
  font-weight: 600;
}

.reenter-icon {
  font-size: 1rem;
  color: #10a37f;
  background: rgba(16, 163, 127, 0.1);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: pulse 2s infinite;
}

.reenter-icon:hover {
  background: rgba(16, 163, 127, 0.2);
  transform: scale(1.1);
  animation: none;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.card-content {
  text-decoration: none;
  color: inherit;
  display: block;
  margin-bottom: 0.8rem;
}

.lecture-title {
  font-size: 1.1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.6rem;
  line-height: 1.3;
}

.lecture-desc {
  color: #64748b;
  font-size: 0.85rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.lecture-meta {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #94a3b8;
}

.lecture-speaker {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(16, 163, 127, 0.1);
  padding: 0.25rem 0.6rem;
  border-radius: 10px;
  color: #10a37f;
  font-weight: 500;
}

.icon {
  font-size: 0.9rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  color: #10a37f;
  font-size: 0.85rem;
  font-weight: 600;
}

.manage-text {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.arrow {
  font-size: 1.2rem;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #10a37f;
}

.lecture-card:hover .arrow {
  transform: translateX(6px);
}

/* 模态框 */
.modal-bg {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  padding: 1rem;
}

.modal {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 
    0 30px 80px rgba(0, 0, 0, 0.2),
    0 15px 40px rgba(16, 163, 127, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: rgba(148, 163, 184, 0.15);
  border: none;
  border-radius: 12px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.3rem;
  color: #64748b;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  transform: scale(1.1);
}

.modal-body {
  padding: 2rem;
}

.input-group {
  margin-bottom: 1.8rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.8rem;
  font-weight: 600;
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1rem;
}

.input-group input,
.input-group textarea {
  width: 100%;
  padding: 1rem 1.2rem;
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.input-group input:focus,
.input-group textarea:focus {
  outline: none;
  border-color: #10a37f;
  box-shadow: 0 0 0 3px rgba(16, 163, 127, 0.1);
  background: rgba(255, 255, 255, 0.95);
}

.input-group textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem 2rem 2rem;
  justify-content: flex-end;
}

.btn-cancel,
.btn-create {
  padding: 0.8rem 1.8rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  min-width: 120px;
}

.btn-cancel {
  background: rgba(148, 163, 184, 0.15);
  color: #64748b;
}

.btn-cancel:hover {
  background: rgba(148, 163, 184, 0.25);
  transform: translateY(-1px);
}

.btn-create {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 163, 127, 0.3);
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 163, 127, 0.4);
}

.btn-create:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 消息提示 */
.message {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.message.success {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
}

.message.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 加载动画 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .speaker-home-bg {
    padding: 1rem 0.5rem;
  }
  
  .speaker-home {
    padding: 2rem 1.5rem;
    border-radius: 16px;
  }
  
  .speaker-title {
    font-size: 2rem;
  }
  
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .create-btn {
    width: 100%;
  }
  
  .lectures-grid {
    grid-template-columns: 1fr;
  }
  
  .modal {
    margin: 1rem;
    max-width: none;
    border-radius: 16px;
  }
}

@media (max-width: 480px) {
  .speaker-title {
    font-size: 1.8rem;
  }
  
  .title-icon {
    font-size: 2.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .btn-cancel,
  .btn-create {
    width: 100%;
  }
  
  .action-buttons-header {
    gap: 0.3rem;
  }
  
  .reenter-icon {
    width: 24px;
    height: 24px;
    font-size: 1rem;
  }
}
</style>