<template>
  <div>
    <h3>答题区</h3>
    <div v-if="quiz">
      <div>{{ quiz.question }}</div>
      <ul>
        <li v-for="(opt, idx) in quiz.options" :key="idx">
          <button :disabled="answered || timeLeft === 0" @click="submit(idx)">
            {{ opt }}
          </button>
        </li>
      </ul>
      <div>剩余时间：{{ timeLeft }} 秒</div>
      <div v-if="answered">
        <span v-if="result !== null">{{ result ? '回答正确' : '回答错误' }}</span>
      </div>
    </div>
    <div v-else>暂无题目</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const route = useRoute()
const lectureId = route.params.id
const quiz = ref<any>(null)
const timeLeft = ref(10)
const timer = ref<any>(null)
const answered = ref(false)
const result = ref<boolean|null>(null)

const fetchQuiz = async () => {
  const res = await axios.get(`/api/lecture/${lectureId}/quiz`)
  quiz.value = res.data.quiz
  timeLeft.value = 10
  answered.value = false
  result.value = null
  startTimer()
}

const startTimer = () => {
  if (timer.value) clearInterval(timer.value)
  timer.value = setInterval(() => {
    if (timeLeft.value > 0) timeLeft.value--
    if (timeLeft.value === 0) clearInterval(timer.value)
  }, 1000)
}

const submit = async (idx: number) => {
  if (answered.value || timeLeft.value === 0) return
  answered.value = true
  const res = await axios.post(`/api/lecture/${lectureId}/quiz/answer`, { answer: idx })
  result.value = res.data.correct
}

onMounted(fetchQuiz)
onUnmounted(() => { if (timer.value) clearInterval(timer.value) })
</script>