<template>
  <div id="app">
    <!-- 现代化头部导航 -->
    <header class="app-header">
      <div class="header-container">
        <div class="brand-section">
          <div class="brand-icon">🎓</div>
          <h1 class="brand-title" @click="handleHomeClick" style="cursor: pointer;">PQ智能系统</h1>
          <span class="brand-subtitle">智能讲座互动平台</span>
        </div>
        <nav class="header-nav">
          <div class="nav-links">
            <a href="#" class="nav-link" :class="{ active: isHomeActive }" @click.prevent="handleHomeClick">
              <span class="link-icon">🏠</span>
              <span class="link-text">首页</span>
            </a>
            <div class="settings-dropdown" v-if="getUserRole()">
              <a href="#" class="nav-link" @click.prevent="toggleSettingsDropdown" :class="{ active: showSettingsDropdown }">
                <span class="link-icon">⚙️</span>
                <span class="link-text">设置</span>
                <span class="dropdown-arrow" :class="{ rotated: showSettingsDropdown }">▼</span>
              </a>
              <div class="dropdown-menu" v-show="showSettingsDropdown">
                <a href="#" class="dropdown-item" @click.prevent="handleEditProfile">
                  <span class="dropdown-icon">👤</span>
                  <span>修改信息</span>
                </a>
                <a href="#" class="dropdown-item" @click.prevent="handleChangePassword">
                  <span class="dropdown-icon">🔑</span>
                  <span>修改密码</span>
                </a>
                <a href="#" class="dropdown-item" @click.prevent="handleAccountSettings">
                  <span class="dropdown-icon">⚙️</span>
                  <span>账号设置</span>
                </a>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item danger" @click.prevent="handleLogout">
                  <span class="dropdown-icon">🚪</span>
                  <span>退出登录</span>
                </a>
              </div>
            </div>
          </div>
          <div class="user-info" v-if="getUserRole()">
            <span class="user-role-badge" :class="getUserRole()">
              {{ getUserRole() === 'speaker' ? '📢 讲者' : '👥 听众' }}
            </span>
          </div>
        </nav>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <div class="app-content">
      <component :is="isLectureLayout ? 'div' : 'main'" class="content-wrapper">
        <router-view />
      </component>
    </div>

    <!-- 简洁页脚 -->
    <footer class="app-footer">
      <div class="footer-container">
        <small>© 2024 PQ PopQuiz Web. 保留所有权利.</small>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, onMounted, onUnmounted } from 'vue'

const route = useRoute()
const router = useRouter()

// 设置下拉菜单状态
const showSettingsDropdown = ref(false)

const isLectureLayout = computed(() => 
  route.path.startsWith('/speaker/lecture/') || route.path.startsWith('/listener/lecture/')
)

// 设置下拉菜单处理
const toggleSettingsDropdown = () => {
  showSettingsDropdown.value = !showSettingsDropdown.value
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  const dropdown = event.target.closest('.settings-dropdown')
  if (!dropdown) {
    showSettingsDropdown.value = false
  }
}

// 修改个人信息
const handleEditProfile = () => {
  showSettingsDropdown.value = false
  // TODO: 实现修改个人信息功能
  alert('修改个人信息功能开发中...')
}

// 修改密码
const handleChangePassword = () => {
  showSettingsDropdown.value = false
  // TODO: 实现修改密码功能
  alert('修改密码功能开发中...')
}

// 账号设置
const handleAccountSettings = () => {
  showSettingsDropdown.value = false
  // TODO: 实现账号设置功能
  alert('账号设置功能开发中...')
}

// 生命周期钩子
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 获取用户角色
const getUserRole = () => {
  const token = localStorage.getItem('token')
  if (!token) return null
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role
  } catch (e) {
    console.error('Token解析失败:', e)
    return null
  }
}

// 首页按钮点击处理
const handleHomeClick = () => {
  const userRole = getUserRole()
  
  if (userRole === 'speaker') {
    router.push('/speaker/home')
  } else if (userRole === 'listener') {
    router.push('/listener/home')
  } else {
    // 未登录或无效token，跳转到登录页面
    router.push('/login')
  }
}

// 退出登录处理
const handleLogout = () => {
  showSettingsDropdown.value = false
  if (confirm('确定要退出登录吗？')) {
    // 清除本地存储的认证信息
    localStorage.removeItem('token')
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    
    // 清除任何其他可能的用户数据
    sessionStorage.clear()
    
    // 跳转到登录页面
    router.push('/login')
    
    // 可选：显示退出成功的提示
    setTimeout(() => {
      alert('已成功退出登录')
    }, 100)
  }
}

// 检查当前路由是否为首页
const isHomeActive = computed(() => {
  const userRole = getUserRole()
  if (userRole === 'speaker') {
    return route.path === '/speaker/home'
  } else if (userRole === 'listener') {
    return route.path === '/listener/home'
  }
  return route.path === '/' || route.path === '/login'
})
</script>

<style>
/* 全局重置和基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  background: #ffffff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  line-height: 1.6;
  color: #333;
}

/* 现代化头部导航 */
.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.brand-title {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #3eaf7c 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.5px;
  transition: all 0.3s ease;
}

.brand-title:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

.brand-subtitle {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
  margin-left: 0.5rem;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.settings-dropdown {
  position: relative;
}

.dropdown-arrow {
  font-size: 0.8rem;
  margin-left: 0.25rem;
  transition: transform 0.3s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 1001;
  overflow: hidden;
  margin-top: 0.5rem;
  animation: dropdownSlideIn 0.3s ease-out;
}

@keyframes dropdownSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #374151;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.dropdown-item:hover {
  background: rgba(62, 175, 124, 0.1);
  color: #3eaf7c;
}

.dropdown-item.danger {
  color: #ef4444;
}

.dropdown-item.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.dropdown-icon {
  font-size: 1rem;
  width: 1.2rem;
  text-align: center;
}

.dropdown-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 0.5rem 0;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-role-badge {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.user-role-badge.speaker {
  background: linear-gradient(135deg, rgba(62, 175, 124, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%);
  color: #3eaf7c;
  border-color: rgba(62, 175, 124, 0.3);
}

.user-role-badge.listener {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(62, 175, 124, 0.1) 100%);
  color: #667eea;
  border-color: rgba(102, 126, 234, 0.3);
}

.user-role-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.nav-link:hover,
.nav-link.active {
  color: #3eaf7c;
  background: rgba(62, 175, 124, 0.1);
  transform: translateY(-1px);
}

.link-icon {
  font-size: 1.1rem;
}

/* 主要内容区域 */
.app-content {
  flex: 1;
  margin-top: 80px; /* 头部导航高度 */
  min-height: calc(100vh - 80px - 200px); /* 减去头部和页脚高度 */
}

.content-wrapper {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
}

main.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 简洁页脚 */
.app-footer {
  background: #222;
  color: #fff;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-container small {
  font-size: 0.9rem;
  color: #a0aec0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .header-container {
    padding: 1rem 1.5rem;
  }
  
  .brand-title {
    font-size: 1.8rem;
  }
  
  .brand-subtitle {
    display: none;
  }
  
  .footer-brand {
    grid-column: 1 / -1;
    margin-bottom: 1rem;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .brand-section {
    gap: 0.75rem;
  }
  
  .brand-icon {
    font-size: 2rem;
  }
  
  .brand-title {
    font-size: 1.5rem;
  }
  
  .header-nav {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
  
  .nav-links {
    gap: 1rem;
    justify-content: center;
  }
  
  .dropdown-menu {
    right: -1rem;
    min-width: 180px;
  }
  
  .dropdown-item {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
  }
  
  .nav-link {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
  
  .user-info {
    justify-content: center;
  }
  
  .app-content {
    margin-top: 160px; /* 调整移动端头部高度 */
  }
  
  main.content-wrapper {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .brand-section {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .brand-title {
    font-size: 1.3rem;
  }
  
  .header-nav {
    gap: 0.8rem;
  }
  
  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .dropdown-arrow {
    display: none;
  }
  
  .dropdown-menu {
    right: -2rem;
    min-width: 160px;
  }
  
  .dropdown-item {
    padding: 0.5rem 0.7rem;
    font-size: 0.8rem;
  }

  .link-text {
    display: none;
  }  .nav-link {
    padding: 0.5rem;
    border-radius: 50%;
    min-width: 40px;
    justify-content: center;
  }
  
  .user-role-badge {
    font-size: 0.75rem;
    padding: 0.3rem 0.8rem;
  }
  
  .app-content {
    margin-top: 180px;
  }
}

/* 美化滚动条 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #3eaf7c 0%, #667eea 100%);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #329c6b 0%, #5a6fd8 100%);
}

/* 页面加载动画 */
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

.app-content {
  animation: fadeIn 0.6s ease-out;
}

/* 链接和按钮的通用样式 */
a {
  color: #3eaf7c;
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: #329c6b;
}

/* 表单元素美化 */
input, textarea, select, button {
  font-family: inherit;
}

button {
  cursor: pointer;
  transition: all 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
}

/* 焦点样式优化 */
*:focus {
  outline: 2px solid #3eaf7c;
  outline-offset: 2px;
  border-radius: 4px;
}
</style>
