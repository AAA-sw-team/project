<template>
  <div class="main-content">
    <div class="listener-home">
      <h2 class="listener-title">讲座列表</h2>
      <div class="lecture-list">
        <div v-for="lecture in lectures" :key="lecture.id" class="lecture-card">
          <router-link :to="`/listener/lecture/${lecture.id}/quiz`">
            <div class="lecture-title">{{ lecture.title }}</div>
            <div class="lecture-meta">
              <span class="lecture-speaker">讲师：{{ lecture.name || lecture.speaker || '未知' }}</span>
              <span class="lecture-time">创建时间：{{ formatTime(lecture.created_at || '') }}</span>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
interface Lecture {
  id: number;
  title: string;
  status?: number;
  name?: string;
  speaker?: string;
  created_at?: string;
}
const lectures = ref<Lecture[]>([])

async function fetchLectures() {
  const res = await fetch('/api/lectures')
  if (res.ok) {
    const allLectures = await res.json()
    // 兼容没有status字段的情况，优先显示进行中，有就过滤，没有就全显示
    if (allLectures.length && allLectures[0].status !== undefined) {
      lectures.value = allLectures.filter((lecture: any) => lecture.status === 1)
    } else {
      lectures.value = allLectures
    }
    console.log('讲座数据:', lectures.value)
  }
}

let timer: any = null
onMounted(() => {
  fetchLectures()
  timer = setInterval(fetchLectures, 10000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function formatTime(time: string) {
  if (!time) return '无';
  const d = new Date(time)
  return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}
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
.lecture-meta {
  margin-top: 10px;
  font-size: 0.98rem;
  color: #4b9087;
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
}
.lecture-speaker {
  font-weight: 500;
}
.lecture-time {
  font-size: 0.92rem;
  color: #7bb7b0;
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
.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}
</style>