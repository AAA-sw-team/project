<template>
  <div class="lecture-layout">
    <aside class="sidebar">
      <button class="all-lectures-btn" @click="goHome">所有讲座</button>
      <!-- <router-link :to="`/organizer/lectures/${lectureId}/score`" :class="{active: isActive('score')}">成绩总览</router-link> -->
      <router-link :to="`/organizer/lectures/${lectureId}/discussion`" :class="{active: isActive('discussion')}">讨论区</router-link>
      <router-link :to="`/organizer/lectures/${lectureId}/feedback`" :class="{active: isActive('feedback')}">听众反馈</router-link>
    </aside>
    <main class="content">
      <div class="content-card">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const lectureId = route.params.id
function isActive(tab: string) {
  return route.path.includes(`/${tab}`)
}
function goHome() {
  router.push('/organizer')
}
</script>

<style scoped>
.lecture-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(90deg, #e0f7fa 0%, #f6fcfa 100%);
  border-radius: 0;
  box-shadow: none;
  margin: 0;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  overflow: hidden;
}
.sidebar {
  width: 200px;
  min-width: 140px;
  background: linear-gradient(135deg, #a8e6cf 0%, #f5f5f5 100%);
  border-radius: 0;
  box-shadow: 2px 0 12px rgba(44,209,171,0.07);
  padding: 120px 0 40px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
}
.sidebar a {
  display: block;
  width: 100%;
  padding: 14px 32px;
  margin-bottom: 0;
  font-size: 1.1rem;
  color: #2d8c7f;
  border-radius: 0 24px 24px 0;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.18s, color 0.18s, font-weight 0.18s;
}
.sidebar a.active, .sidebar a:hover {
  background: #e0f7fa;
  color: #26c6da;
  font-weight: 700;
}
.all-lectures-btn {
  width: 100%;
  padding: 16px 0;
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: #fff;
  border: none;
  border-radius: 0 24px 24px 0;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 18px;
  transition: background 0.18s, color 0.18s;
}
.all-lectures-btn:hover {
  background: #059669;
  color: #fff;
}
.content {
  flex: 1;
  padding: 120px 32px 48px 32px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
  overflow-y: auto;
  height: 100vh;
}
.content-card {
  width: 100%;
  max-width: 900px;
  background: #fff;
  border-radius: 0;
  box-shadow: 0 2px 12px rgba(44,209,171,0.07);
  padding: 36px 28px;
  min-height: calc(100vh - 200px);
  box-sizing: border-box;
  margin-bottom: 2rem;
}
@media (max-width: 900px) {
  .lecture-layout {
    flex-direction: column;
    min-height: 100vh;
    border-radius: 0;
    width: 100vw;
  }
  .sidebar {
    flex-direction: row;
    width: 100%;
    min-width: unset;
    border-radius: 0;
    box-shadow: 0 2px 8px rgba(44,209,171,0.07);
    padding: 98px 0 18px 0;
    align-items: center;
    justify-content: center;
    gap: 0;
  }
  .sidebar a {
    border-radius: 18px 18px 0 0;
    padding: 10px 18px;
    margin: 0 8px;
    text-align: center;
    font-size: 1rem;
  }
  .content {
    padding: 18px 4vw;
    overflow-y: auto;
    height: calc(100vh - 120px);
  }
  .content-card {
    padding: 18px 8px;
    min-height: 200px;
    border-radius: 0;
    width: 100%;
  }
}
</style>
