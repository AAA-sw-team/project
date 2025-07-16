<template>
  <div class="stats-wrapper">
    <h2>答题情况</h2>
    <div v-if="loading">加载中...</div>
    <div v-else>
      <div v-for="lecture in lectures" :key="lecture.id" class="lecture-block">
        <h3>{{ lecture.title }}</h3>
        <ul class="user-list">
          <li v-for="user in lecture.participants" :key="user.id" @click="selectUser(lecture, user)" :class="{selected: selectedUser && selectedUser.id === user.id && selectedLecture.id === lecture.id}">
            {{ user.nickname || user.username }}
          </li>
        </ul>
      </div>
      <div v-if="selectedUser" class="user-detail">
        <h4>参与者：{{ selectedUser.nickname || selectedUser.username }}</h4>
        <div v-if="userStats">
          <p>答题正确率：{{ userStats.correctRate }}%</p>
          <p>答对题数：{{ userStats.correct }}/{{ userStats.total }}</p>
        </div>
        <div v-else>加载中...</div>
      </div>
    </div>
  </div>
</template>
  
  <script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  // 这里用mock数据，后续可替换为API请求
  const loading = ref(true)
  const lectures = ref([
    {
      id: 1,
      title: 'AI时代的未来',
      participants: [
        { id: 101, username: 'user1', nickname: '小明' },
        { id: 102, username: 'user2', nickname: '小红' }
      ]
    },
    {
      id: 2,
      title: '大数据与生活',
      participants: [
        { id: 103, username: 'user3', nickname: '小刚' }
      ]
    }
  ])
  const selectedLecture = ref<any>(null)
  const selectedUser = ref<any>(null)
  const userStats = ref<any>(null)
  
  const selectUser = (lecture: any, user: any) => {
    selectedLecture.value = lecture
    selectedUser.value = user
    userStats.value = null
    // 模拟异步加载
    setTimeout(() => {
      userStats.value = {
        correct: Math.floor(Math.random() * 10),
        total: 10,
        correctRate: Math.floor(Math.random() * 100)
      }
    }, 500)
  }
  
  onMounted(() => {
    setTimeout(() => {
      loading.value = false
    }, 500)
  })
  </script>
  
  <style scoped>
  /* .stats-wrapper {
    width: 100%;
    max-width: none;
    min-height: 70vh;
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 6px 32px 0 rgba(60,120,200,0.13);
    padding: 2.5rem 3.5rem 2rem 3.5rem;
    margin: 2.5rem 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
  } */
  .lecture-block {
    width: 98%;
    margin-bottom: 1.2rem;
    padding: 1rem;
    background: #f7fafc;
    border-radius: 10px;
    box-shadow: 0 2px 8px 0 rgba(60,120,200,0.06);
  }
  .user-list {
    display: flex;
    gap: 1.2rem;
    flex-wrap: wrap;
    margin: 0.5rem 0 0 0;
    padding: 0;
    list-style: none;
  }
  .user-list li {
    padding: 0.5rem 1.2rem;
    background: #e0eafc;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .user-list li.selected, .user-list li:hover {
    background: #3eaf7c;
    color: #fff;
  }
  .user-detail {
    width: 98%;
    margin-top: 2rem;
    padding: 1.2rem;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 8px 0 rgba(60,120,200,0.09);
  }
  </style>
  