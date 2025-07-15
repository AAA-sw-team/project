<template>
  <div>
    <h4>统计图表</h4>
    <!-- 这里可用ECharts等库做可视化，先用简单表格占位 -->
    <table>
      <tr><th>题号</th><th>答对人数</th><th>答题人数</th></tr>
      <tr v-for="item in stats.quizzes || []" :key="item.id">
        <td>{{ item.id }}</td>
        <td>{{ item.correct }}</td>
        <td>{{ item.total }}</td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
const props = defineProps({ stats: Object })
</script>
