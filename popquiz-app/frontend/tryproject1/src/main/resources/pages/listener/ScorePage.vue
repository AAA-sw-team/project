<template>
  <div>
    <h3>成绩查询</h3>
    <div v-if="score">
      <div>你的得分：{{ score.value }}</div>
      <div>正确答案：{{ score.correctAnswers.join(', ') }}</div>
      <div>你的排名：{{ score.rank }}</div>
    </div>
    <div v-else>暂无成绩</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const route = useRoute()
const lectureId = route.params.id
const score = ref<any>(null)

onMounted(async () => {
  const res = await axios.get(`/api/lecture/${lectureId}/score`)
  score.value = res.data
})
</script>