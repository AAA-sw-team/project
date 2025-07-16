<template>
  <div style="height: 100vh; position: relative; background: #f7f7f7;">
    <Sidebar :active="activeTab" @change="activeTab = $event" class="fixed-sidebar" />
    <div class="main-content">
      <QuizCard v-if="activeTab === 'quiz'" :question="question" :options="options" />
      <DiscussionArea v-else-if="activeTab === 'discussion'" :lectureId="lectureId" />
      <component v-else-if="activeTab === 'stats'" :is="StatsChart" />
      <FeedbackForm v-else-if="activeTab === 'feedback'" :lectureId="lectureId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '../../components/Sidebar.vue'
import QuizCard from '../../components/QuizCard.vue'
import DiscussionArea from '../../components/DiscussionArea.vue'
import FeedbackForm from '../../components/FeedbackForm.vue'
// 占位统计组件
const StatsChart = { template: '<div>统计功能开发中</div>' }

const route = useRoute()
const lectureId = route.params.id as string

const activeTab = ref('quiz')

// mock数据
const question = ref({
  text: 'AI的全称是什么？',
  id: 'q1'
})
const options = ref(['人工智能', '自动集成', '智能分析', '自动信息'])
</script>

<style scoped>
.fixed-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 200px;
  background: #fff;
  border-right: 1px solid #eee;
  z-index: 10;
  box-shadow: 2px 0 8px rgba(60,120,200,0.04);
  display: flex;
  flex-direction: column;
  padding-top: 0;
}
.main-content {
  margin-left: 200px;
  padding: 48px 32px 0 32px;
  min-height: 100vh;
  background: #f7f7f7;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.quiz-card {
  box-shadow: 0 2px 16px rgba(60,120,200,0.08);
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 32px 40px;
  background: #fff;
  min-width: 340px;
  max-width: 400px;
}
</style>