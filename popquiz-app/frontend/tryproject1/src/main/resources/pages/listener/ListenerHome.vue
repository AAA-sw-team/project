<template>
  <div class="listener-home-bg">
    <div class="listener-home">
      <h2 class="listener-title">讲座列表</h2>
      <div class="lecture-list">
        <div v-for="lecture in lectures" :key="lecture.id" class="lecture-card">
          <router-link :to="`/listener/lecture/${lecture.id}/quiz`">
            <div class="lecture-title">{{ lecture.title }}</div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
const lectures = ref<{id: number, title: string}[]>([])
// 假设从后端获取讲座列表
onMounted(async () => {
  // 这里用静态数据，实际应调用API
  lectures.value = [
    { id: 1, title: 'Vue3 响应式原理' },
    { id: 2, title: 'JavaScript 进阶' }
  ]
})
</script>
<style scoped>
.listener-home-bg {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f7fa 0%, #f6fcfa 100%);
  overflow-x: hidden;
}
.listener-home {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 4px solid #a8e6cf;
  border-radius: 32px;
  background: rgba(255,255,255,0.95);
  margin: 48px auto;
  padding: 48px 0 48px 0;
  width: 90vw;
  max-width: 500px;
  min-width: 260px;
  box-sizing: border-box;
  box-shadow: 0 8px 32px rgba(64,158,255,0.08), 0 1.5px 8px rgba(168,230,207,0.10);
  transition: box-shadow 0.2s;
}
.listener-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #2d8c7f;
  margin-bottom: 32px;
  letter-spacing: 2px;
  text-align: center;
}
.lecture-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin-top: 0;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.lecture-card {
  width: 92%;
  max-width: 420px;
  margin: 0 auto;
  background: #f8fdfb;
  border: 2px solid #b2dfdb;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(44, 209, 171, 0.07);
  transition: box-shadow 0.22s, border-color 0.22s, transform 0.18s;
  padding: 32px 18px;
  text-align: center;
  cursor: pointer;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  will-change: transform, box-shadow;
}
.lecture-card:hover {
  border-color: #26c6da;
  box-shadow: 0 8px 32px rgba(44,209,171,0.13);
  transform: translateY(-4px) scale(1.025);
}
.lecture-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d8c7f;
  text-decoration: none;
  letter-spacing: 1px;
}
.lecture-card a {
  text-decoration: none;
  color: inherit;
  width: 100%;
  display: block;
}
@media (max-width: 600px) {
  .listener-home {
    padding: 24px 0 24px 0;
    max-width: 98vw;
    border-radius: 18px;
  }
  .lecture-card {
    padding: 20px 8px;
    border-radius: 12px;
  }
  .listener-title {
    font-size: 1.3rem;
    margin-bottom: 18px;
  }
}
</style>