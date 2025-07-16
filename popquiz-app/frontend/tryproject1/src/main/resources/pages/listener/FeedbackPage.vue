<template>
  <div>
    <h3>反馈</h3>
    <FeedbackForm :lectureId="lectureId" @submit="submitFeedback" />
    <div v-if="feedbacks.length">
      <h4>历史反馈</h4>
      <ul>
        <li v-for="item in feedbacks" :key="item.id">{{ item.text }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import FeedbackForm from '../../components/FeedbackForm.vue'

const route = useRoute()
const lectureId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
const feedbacks = ref<any[]>([])

const submitFeedback = async (feedback: any) => {
  await axios.post(`/api/lecture/${lectureId}/feedback`, feedback)
  fetchFeedbacks()
}

const fetchFeedbacks = async () => {
  const res = await axios.get(`/api/lecture/${lectureId}/feedback`)
  feedbacks.value = res.data.feedbacks
}

onMounted(fetchFeedbacks)
</script>