<template>
  <div>
    <h4>我的成绩</h4>
    <p>答对：{{ stats.correct }} / 总题数：{{ stats.total }}</p>
    <p v-if="stats.rank">排名：{{ stats.rank }}</p>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
const props = defineProps({ stats: Object })
</script>