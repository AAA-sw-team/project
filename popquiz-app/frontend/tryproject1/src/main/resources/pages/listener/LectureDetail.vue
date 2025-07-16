<template>
  <div class="lecture-detail">
    <Sidebar :active="activeTab" @change="activeTab = $event" />
    <div class="main-content">
      <component :is="currentComponent" :lectureId="lectureId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'
import QuizCard from '../components/QuizCard.vue'
import DiscussionArea from '../components/DiscussionArea.vue'
import StatsChart from '../components/StatsChart.vue'
import FeedbackForm from '../components/FeedbackForm.vue'

const route = useRoute()
const lectureId = route.params.id

const activeTab = ref('quiz') // 默认显示答题

const currentComponent = computed(() => {
  switch (activeTab.value) {
    case 'quiz': return QuizCard
    case 'discussion': return DiscussionArea
    case 'stats': return StatsChart
    case 'feedback': return FeedbackForm
    default: return QuizCard
  }
})
</script>

<style scoped>
.lecture-detail {
  display: flex;
  min-height: 80vh;
}
.main-content {
  flex: 1;
  padding: 2rem;
}
</style>