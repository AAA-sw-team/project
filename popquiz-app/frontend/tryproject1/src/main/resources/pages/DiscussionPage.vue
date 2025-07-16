<template>
  <div>
    <div v-if="quiz">
      <h3>题目讨论区</h3>
      <div class="quiz-block">
        <h4>{{ quiz.question }}</h4>
        <ul>
          <li v-for="(opt, idx) in quiz.options" :key="idx">{{ String.fromCharCode(65+idx) }}. {{ opt }}</li>
        </ul>
      </div>
      <DiscussionArea :quizId="quizId" />
    </div>
    <div v-else>正在加载题目信息...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import DiscussionArea from '../components/DiscussionArea.vue'

const route = useRoute()
const quizId = route.params.quizId
const quiz = ref<any>(null)

onMounted(async () => {
  if (quizId) {
    const res = await axios.get(`/api/quiz/${quizId}`)
    quiz.value = res.data.quiz
  }
})
</script>

<style scoped>
.quiz-block {
  background: #fff;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(60,120,200,0.08);
}
</style>
