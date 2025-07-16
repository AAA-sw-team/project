<template>
<<<<<<< Updated upstream
  <div class="user-stats">
    <h4>我的成绩</h4>
    <p>答对：{{ stats.correct }} / 总题数：{{ stats.total }}</p>
    <p>准确率：{{ accuracy }}%</p>
=======
  <div>
    <h4>我的成绩</h4>
    <p>答对：{{ stats.correct }} / 总题数：{{ stats.total }}</p>
>>>>>>> Stashed changes
    <p v-if="stats.rank">排名：{{ stats.rank }}</p>
  </div>
</template>

<script setup lang="ts">
<<<<<<< Updated upstream
import { defineProps, computed } from 'vue'
const props = defineProps({ stats: Object })
const accuracy = computed(() =>
  props.stats.total ? ((props.stats.correct / props.stats.total) * 100).toFixed(1) : 0
)
</script>
<style scoped>
.user-stats { margin: 1.2rem 0; }
</style>
=======
import { defineProps } from 'vue'
const props = defineProps({ stats: Object })
</script>
>>>>>>> Stashed changes
