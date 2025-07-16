<template>
  <div>
    <h2>讲座列表</h2>
    <ul class="lecture-list">
      <li v-for="lecture in lectures" :key="lecture.id" class="lecture-card">
        <router-link :to="`/lecture/${lecture.id}`">{{ lecture.title }}</router-link>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import axios from 'axios'

const lectures = ref([
  { id: 1, title: 'AI与教育创新' },
  { id: 2, title: '大数据与智能分析' },
  { id: 3, title: '未来互联网技术' }
])

// 如需后端接口，取消注释
// onMounted(async () => {
//   const res = await axios.get('/api/lectures')
//   lectures.value = res.data.lectures
// })
</script>

<style scoped>
.lecture-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 400px;
  margin: 32px auto 0 auto;
}
.lecture-card {
  border: 1px solid #d0d7de;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(60,120,200,0.08);
  padding: 1.2rem 1.5rem;
  background: #fff;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.lecture-card:hover {
  border-color: #3eaf7c;
  box-shadow: 0 4px 16px rgba(62,175,124,0.15);
}
.lecture-card a {
  text-decoration: none;
  color: #3eaf7c;
  font-size: 1.15rem;
  font-weight: 600;
}
.lecture-card a:hover {
  text-decoration: underline;
}
</style>