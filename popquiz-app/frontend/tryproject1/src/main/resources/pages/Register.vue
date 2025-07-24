<template>
  <div>
    <div class="register-container">
      <h2>注册</h2>
      
      <!-- 错误提示区域 -->
      <div v-if="errorMessage" class="error-message">
        <div class="message-header">
          <i class="error-icon">❌</i>
          <strong>注册失败</strong>
        </div>
        <p class="message-text">{{ errorMessage }}</p>
        <button class="message-close" @click="clearMessages">×</button>
      </div>
      
      <!-- 成功提示区域 -->
      <div v-if="successMessage" class="success-message">
        <div class="message-header">
          <i class="success-icon">✅</i>
          <strong>注册成功</strong>
        </div>
        <p class="message-text">{{ successMessage }}</p>
      </div>
      
      <form @submit.prevent="handleRegister">
        <div class="input-group">
          <input 
            v-model="username" 
            placeholder="用户名" 
            required 
            class="input"
            :class="{ 'input-error': errors.username }"
            @input="clearFieldError('username')"
          />
          <span v-if="errors.username" class="field-error">{{ errors.username }}</span>
        </div>
        
        <div class="input-group">
          <input 
            v-model="password" 
            type="password" 
            placeholder="密码" 
            required 
            class="input"
            :class="{ 'input-error': errors.password }"
            @input="clearFieldError('password')"
          />
          <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
        </div>
        
        <div class="input-group">
          <input 
            v-model="confirmPassword" 
            type="password" 
            placeholder="确认密码" 
            required 
            class="input"
            :class="{ 'input-error': errors.confirmPassword }"
            @input="clearFieldError('confirmPassword')"
          />
          <span v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</span>
        </div>
        
        <div class="input-group">
          <select 
            v-model="role" 
            required 
            class="input"
            :class="{ 'input-error': errors.role }"
            @change="clearFieldError('role')"
          >
            <option value="" disabled>选择角色</option>
            <option value="listener">听众</option>
            <option value="speaker">演讲者</option>
            <option value="organizer">组织者</option>
          </select>
          <span v-if="errors.role" class="field-error">{{ errors.role }}</span>
        </div>
        
        <button 
          type="submit" 
          class="btn" 
          :disabled="isLoading || !isFormValid"
          :class="{ 'btn-loading': isLoading }"
        >
          <span v-if="isLoading" class="loading-spinner">🔄</span>
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
        
        <p class="login-tip">
          已有账号？<router-link to="/login">登录</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const role = ref('')
const router = useRouter()

// 状态管理
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const errors = ref({
  username: '',
  password: '',
  confirmPassword: '',
  role: ''
})

// 表单验证
const isFormValid = computed(() => {
  return username.value.trim() && 
         password.value.trim() && 
         confirmPassword.value.trim() &&
         role.value && 
         !Object.values(errors.value).some(error => error)
})

// 清除字段错误
const clearFieldError = (field: string) => {
  errors.value[field] = ''
  if (errorMessage.value) {
    errorMessage.value = ''
  }
}

// 清除所有提示信息
const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
  errors.value = {
    username: '',
    password: '',
    confirmPassword: '',
    role: ''
  }
}

// 表单验证
const validateForm = () => {
  clearMessages()
  let isValid = true

  // 用户名验证
  if (!username.value.trim()) {
    errors.value.username = '请输入用户名'
    isValid = false
  } else if (username.value.trim().length < 2) {
    errors.value.username = '用户名至少需要2个字符'
    isValid = false
  } else if (username.value.trim().length > 20) {
    errors.value.username = '用户名不能超过20个字符'
    isValid = false
  } else if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username.value.trim())) {
    errors.value.username = '用户名只能包含字母、数字、下划线和中文'
    isValid = false
  }

  // 密码验证
  if (!password.value) {
    errors.value.password = '请输入密码'
    isValid = false
  } else if (password.value.length < 6) {
    errors.value.password = '密码至少需要6个字符'
    isValid = false
  } else if (password.value.length > 50) {
    errors.value.password = '密码不能超过50个字符'
    isValid = false
  } else if (!/^(?=.*[a-zA-Z0-9])/.test(password.value)) {
    errors.value.password = '密码必须包含至少一个字母或数字'
    isValid = false
  }

  // 确认密码验证
  if (!confirmPassword.value) {
    errors.value.confirmPassword = '请确认密码'
    isValid = false
  } else if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = '两次输入的密码不一致'
    isValid = false
  }

  // 角色验证
  if (!role.value) {
    errors.value.role = '请选择用户角色'
    isValid = false
  } else if (!['listener', 'speaker', 'organizer'].includes(role.value)) {
    errors.value.role = '请选择有效的用户角色'
    isValid = false
  }

  return isValid
}

// 错误处理函数
const handleError = (error: any) => {
  console.error('注册错误:', error)
  
  if (error.response) {
    // 服务器返回错误响应
    const status = error.response.status
    const data = error.response.data
    
    switch (status) {
      case 400:
        if (data.error?.includes('用户名')) {
          errorMessage.value = '用户名格式不正确，请使用2-20个字符的字母、数字、下划线或中文'
        } else if (data.error?.includes('密码')) {
          errorMessage.value = '密码格式不正确，请使用6-20个字符'
        } else if (data.error?.includes('角色')) {
          errorMessage.value = '请选择有效的用户角色'
        } else {
          errorMessage.value = data.error || '请求参数错误，请检查输入内容'
        }
        break
      case 409:
        errorMessage.value = '用户名已被注册，请选择其他用户名'
        break
      case 422:
        errorMessage.value = '输入数据验证失败，请检查：\n• 用户名：2-20个字符，仅支持字母、数字、下划线、中文\n• 密码：6-20个字符\n• 角色：必须选择听众、演讲者或组织者'
        break
      case 429:
        errorMessage.value = '注册请求过于频繁，请稍后再试'
        break
      case 500:
        errorMessage.value = '服务器内部错误，请稍后重试或联系技术支持'
        break
      case 502:
        errorMessage.value = '服务器网关错误，请稍后重试'
        break
      case 503:
        errorMessage.value = '服务暂时不可用，请稍后重试'
        break
      default:
        errorMessage.value = data.error || `注册失败 (错误代码: ${status})，请稍后重试`
    }
  } else if (error.request) {
    // 网络错误
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      errorMessage.value = '无法连接到服务器，请检查：\n1. 网络连接是否正常\n2. 后端服务是否启动 (端口: 3001)\n3. 防火墙是否阻止连接'
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage.value = '服务器拒绝连接，请确认后端服务已启动'
    } else {
      errorMessage.value = '网络请求超时或失败，请检查网络连接'
    }
  } else {
    // 其他错误
    errorMessage.value = '注册过程中出现未知错误，请刷新页面后重试'
  }
}

const handleRegister = async () => {
  // 表单验证
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  clearMessages()

  try {
    console.log('正在注册...', { 用户名: username.value, 角色: role.value })
    
    const res = await axios.post('/api/auth/register', {
      username: username.value.trim(),
      password: password.value,
      role: role.value
    })
    
    console.log('注册响应:', res.data)
    
    if (res.data.message === '注册成功！') {
      // 注册成功
      const roleText = role.value === 'listener' ? '听众' : 
                      role.value === 'speaker' ? '演讲者' : '组织者'
      successMessage.value = `恭喜您成功注册为${roleText}！\n账户名：${username.value.trim()}\n\n2秒后自动跳转到登录页面...`
      
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      
    } else {
      // 注册失败但有响应
      errorMessage.value = res.data.error || '注册失败，请检查输入信息是否正确'
    }
    
  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-container {
  background: #fff;
  padding: 2.5rem 2rem 2rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(60, 120, 200, 0.12);
  width: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 40px auto;
}

h2 {
  margin-bottom: 1.5rem;
  color: #3eaf7c;
  font-weight: 600;
  letter-spacing: 1px;
}

/* 错误和成功提示样式 */
.error-message {
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fecaca;
  border-left: 4px solid #dc2626;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.9rem;
  animation: slideIn 0.3s ease-out;
  position: relative;
}

.success-message {
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #bbf7d0;
  border-left: 4px solid #16a34a;
  border-radius: 8px;
  color: #16a34a;
  font-size: 0.9rem;
  animation: slideIn 0.3s ease-out;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.message-text {
  margin: 0;
  line-height: 1.5;
  white-space: pre-line;
}

.message-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.message-close:hover {
  opacity: 1;
}

.error-icon, .success-icon {
  font-size: 1.1rem;
}

/* 输入框组样式 */
.input-group {
  width: 100%;
  margin-bottom: 1rem;
}

.input {
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  outline: none;
  box-sizing: border-box;
}

.input:focus {
  border-color: #3eaf7c;
  box-shadow: 0 0 0 3px rgba(62, 175, 124, 0.1);
}

.input-error {
  border-color: #dc2626 !important;
  background-color: #fef2f2;
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.field-error {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: #dc2626;
  animation: slideIn 0.2s ease-out;
}

/* 按钮样式 */
.btn {
  width: 100%;
  padding: 0.7rem 0;
  background: #3eaf7c;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 0.5rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
}

.btn:hover:not(:disabled) {
  background: #329c6b;
  transform: translateY(-1px);
}

.btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.btn-loading {
  background: #9ca3af;
}

.loading-spinner {
  animation: spin 1s linear infinite;
  font-size: 1rem;
}

.login-tip {
  margin-top: 0.5rem;
  font-size: 0.95rem;
  color: #888;
}

.login-tip a {
  color: #3eaf7c;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.login-tip a:hover {
  text-decoration: underline;
  color: #329c6b;
}

/* 动画效果 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 动画效果 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .register-container {
    width: 90%;
    margin: 20px auto;
    padding: 2rem 1.5rem;
  }
}
</style>