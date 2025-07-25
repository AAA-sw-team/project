<template>
  <div class="center-container">
    <div class="organizer-home-bg">
      <div class="organizer-home">
        <div class="header-section">
          <div class="title-icon">📋</div>
          <h2 class="organizer-title">管理界面</h2>
          <p class="subtitle">查看讲座及其用户管理入口</p>
        </div>
        <div class="top-btn-group">
          <button :class="['big-switch-btn', {active: showType==='lectures'}]" @click="showType='lectures'">全部讲座</button>
          <button :class="['big-switch-btn', {active: showType==='users'}]" @click="showType='users'">全部用户</button>
        </div>
        <div v-if="showType==='lectures'" class="lecture-list">
          <div class="list-header">
            <h3>全部讲座</h3>
            <span class="lecture-count">{{ lectures.length }} 个讲座</span>
          </div>
          <div v-if="lectures.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <h4>暂无讲座内容</h4>
          </div>
          <div v-else class="lectures-grid">
            <div v-for="lecture in lectures" :key="lecture.id" class="lecture-card">
              <div class="card-header">
                <div class="status-badge" :class="getStatusClass(lecture.status)">{{ getStatusText(lecture.status) }}</div>
              </div>
              <div class="card-content">
                <div class="lecture-title">{{ lecture.title }}</div>
                <div class="lecture-desc" v-if="lecture.description">{{ lecture.description }}</div>
                <div class="lecture-meta">
                  <div class="lecture-speaker">
                    <span class="icon">👤</span>
                    {{ lecture.name || '未知主讲人' }}
                  </div>
                </div>
              </div>
              <div class="card-footer">
                <button class="manage-btn" @click="goToPage(lecture.id, 'discussion')">讨论区</button>
                <button class="manage-btn" @click="goToPage(lecture.id, 'feedback')">反馈</button>
                <button class="manage-btn" @click="goToPage(lecture.id, 'score')">成绩总览</button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="showType==='users'" class="user-table-section">
          <div class="list-header">
            <h3>全部用户</h3>
            <span class="lecture-count">{{ users.length }} 个用户</span>
          </div>
          <div v-if="users.length === 0" class="empty-state">
            <div class="empty-icon">👥</div>
            <h4>暂无用户数据</h4>
          </div>
          <div v-else class="user-table-wrapper">
            <table class="user-table">
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>用户名</th>
                  <th>角色</th>
                  <th>注册时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>{{ user.nickname || '-' }}</td>
                  <td>{{ user.username }}</td>
                  <td><span :class="'role-badge ' + user.role">{{ getRoleText(user.role) }}</span></td>
                  <td>{{ formatDateTime(user.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
const router = useRouter()
const lectures = ref<any[]>([])
const users = ref<any[]>([])
const showType = ref('') // '' | 'lectures' | 'users'
function getStatusText(status: number) {
  switch (status) {
    case 0: return '未开始'
    case 1: return '进行中'
    case 2: return '已结束'
    default: return '未知'
  }
}
// 角色显示美化
function getRoleText(role) {
  if (role === 'organizer') return '组织者'
  if (role === 'speaker') return '讲师'
  if (role === 'listener') return '听众'
  return role
}
function formatDateTime(dt) {
  if (!dt) return '-';
  const d = new Date(dt)
  if (isNaN(d.getTime())) return dt;
  const y = d.getFullYear()
  const m = (d.getMonth()+1).toString().padStart(2,'0')
  const day = d.getDate().toString().padStart(2,'0')
  const h = d.getHours().toString().padStart(2,'0')
  const min = d.getMinutes().toString().padStart(2,'0')
  return `${y}-${m}-${day} ${h}:${min}`
}
// 获取全部讲座
async function fetchLectures() {
  try {
    const res = await axios.get('/api/lectures')
    lectures.value = res.data
  } catch (e) {
    console.error('获取讲座列表失败', e)
  }
}
// 获取全部用户
async function fetchUsers() {
  const token = localStorage.getItem('token')
  const res = await axios.get('/api/users', {
    headers: { Authorization: `Bearer ${token}` }
  })
  users.value = res.data
}
onMounted(() => {
  // 默认不显示表格
  showType.value = ''
  fetchLectures()
})
watchEffect(() => {
  if (showType.value === 'users' && users.value.length === 0) {
    fetchUsers()
  }
})
function goToPage(id: number, tab: string) {
  router.push(`/organizer/lectures/${id}/${tab}`)
}
// 讲座卡片状态徽章样式
function getStatusClass(status) {
  if (status === 0) return 'status-created'
  if (status === 1) return 'status-teaching'
  if (status === 2) return 'status-ended'
  return 'status-created'
}
</script>
<style scoped>
.center-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-height: 100vh;
  padding: 0;
  margin: 0;
}
.organizer-home-bg {
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
.organizer-home-bg::before {
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
.organizer-home {
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
.organizer-home::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #10a37f 0%, #059669 50%, #047857 100%);
  border-radius: 24px 24px 0 0;
}
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
.organizer-title {
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
  font-size: 1.8rem;
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
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  width: 100%;
}
.lecture-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  padding: 1.8rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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
  margin-bottom: 1rem;
}
.status-badge {
  color: #fff;
  padding: 0.4rem 1rem;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: inline-block;
}
.status-created {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); /* 灰色 未开始 */
}
.status-teaching {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%); /* 绿色 进行中 */
}
.status-ended {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); /* 红色 已结束 */
}
.action-buttons-header {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: none;
  border-radius: 10px;
  padding: 0.6rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.delete-btn:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.1);
}
.card-content {
  text-decoration: none;
  color: inherit;
  display: block;
  margin-bottom: 1rem;
}
.lecture-title {
  font-size: 1.4rem;
  font-weight: 700;
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.8rem;
  line-height: 1.3;
}
.lecture-desc {
  color: #64748b;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.2rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.lecture-meta {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #94a3b8;
}
.lecture-speaker {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(16, 163, 127, 0.1);
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  color: #10a37f;
  font-weight: 500;
}
.icon {
  font-size: 1rem;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.2rem;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  color: #10a37f;
  font-size: 0.9rem;
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
.manage-btn {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1.2rem;
  margin: 0 0.3rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s;
  box-shadow: 0 2px 8px rgba(16,163,127,0.08);
}
.manage-btn:hover {
  background: #059669;
  color: #fff;
  box-shadow: 0 4px 16px rgba(16,163,127,0.18);
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
.top-btn-group {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 2.5rem;
}
.big-switch-btn {
  font-size: 1.3rem;
  font-weight: 700;
  padding: 1.2rem 3.5rem;
  border-radius: 18px;
  border: none;
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: #fff;
  box-shadow: 0 4px 20px rgba(16, 163, 127, 0.13);
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s, color 0.18s;
}
.big-switch-btn.active, .big-switch-btn:hover {
  background: linear-gradient(135deg, #059669 0%, #10a37f 100%);
  color: #fff;
  box-shadow: 0 8px 32px rgba(16, 163, 127, 0.18);
}
.user-table-section {
  width: 100%;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.user-table-wrapper {
  width: 100%;
  max-width: 900px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(44,209,171,0.07);
  padding: 36px 28px;
  margin: 0 auto;
  margin-bottom: 2rem;
}
.user-table {
  width: 100%;
  border-collapse: collapse;
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(44,209,171,0.06);
}
.user-table th, .user-table td {
  padding: 14px 10px;
  text-align: center;
  font-size: 1rem;
}
.user-table th {
  background: #b2dfdb;
  color: #2d8c7f;
  font-weight: 700;
}
.user-table tr:nth-child(even) {
  background: #f6fcfa;
}
.user-table tr:nth-child(odd) {
  background: #f8fdfb;
}
.role-badge {
  display: inline-block;
  padding: 0.3em 1.2em;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1em;
  color: #fff;
}
.role-badge.organizer {
  background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
}
.role-badge.speaker {
  background: linear-gradient(135deg, #26c6da 0%, #00bcd4 100%);
}
.role-badge.listener {
  background: linear-gradient(135deg, #43a047 0%, #66bb6a 100%);
}
@media (max-width: 768px) {
  .organizer-home-bg {
    padding: 1rem 0.5rem;
  }
  .organizer-home {
    padding: 2rem 1.5rem;
    border-radius: 16px;
  }
  .organizer-title {
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
  .organizer-title {
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
  .delete-btn {
    width: 32px;
    height: 32px;
    padding: 0.4rem;
    font-size: 0.9rem;
  }
}
</style> 
 