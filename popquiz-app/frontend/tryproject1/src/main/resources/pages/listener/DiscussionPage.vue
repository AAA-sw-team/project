<template>
  <div>
    <h3>题目讨论区</h3>
    <div v-if="quiz">
      <div>{{ quiz.question }}</div>
      <ul>
        <li v-for="(opt, idx) in quiz.options" :key="idx">{{ opt }}</li>
      </ul>
    </div>
    <div v-else>正在加载题目信息...</div>
    <DiscussionArea :quizId="quizId" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import DiscussionArea from '../../components/DiscussionArea.vue'

const route = useRoute()
const quizId = route.query.quizId // 或根据实际传参方式调整
const quiz = ref<any>(null)

onMounted(async () => {
  if (quizId) {
    const res = await axios.get(`/api/quiz/${quizId}`)
    quiz.value = res.data.quiz
  }
})
</script>