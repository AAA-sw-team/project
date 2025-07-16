<template>
  <div>
    <div class="login-container">
      <h2>登录</h2>
      <form @submit.prevent="handleLogin">
        <input v-model="username" placeholder="用户名" required class="input" />
        <input v-model="password" type="password" placeholder="密码" required class="input" />
        <select v-model="role" required class="input">
          <option value="" disabled>选择角色</option>
          <option value="listener">听众</option>
          <option value="speaker">演讲者</option>
          <option value="organizer">组织者</option>
        </select>
        <button type="submit" class="btn">登录</button>
        <p class="register-tip">
          没有账号？<router-link to="/register">注册</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
const username = ref('')
const password = ref('')
const role = ref('')
const router = useRouter()

const handleLogin = async () => {
  const res = await axios.post('/api/auth/login', { username: username.value, password: password.value, role: role.value })
  if (res.data.success) {
    if (role.value === 'listener') router.push('/listener')
    else if (role.value === 'speaker') router.push('/speaker/index')
    else if (role.value === 'organizer') router.push('/organizer')
  } else {
    alert('登录失败')
  }
}
</script>

<style scoped>
.login-container {
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
.input {
  width: 100%;
  padding: 0.7rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  font-size: 1rem;
  transition: border 0.2s;
  outline: none;
}
.input:focus {
  border-color: #3eaf7c;
}
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
  transition: background 0.2s;
}
.btn:hover {
  background: #329c6b;
}
.register-tip {
  margin-top: 0.5rem;
  font-size: 0.95rem;
  color: #888;
}
.register-tip a {
  color: #3eaf7c;
  text-decoration: none;
  font-weight: 500;
}
.register-tip a:hover {
  text-decoration: underline;
}
</style>