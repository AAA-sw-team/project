<template>
  <div class="sidebar fixed-sidebar">
    <div
      v-for="item in items"
      :key="item.key"
      :class="['sidebar-item', { active: active === item.key }]"
      @click="$emit('change', item.key)"
    >
      {{ item.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps(['active'])
const items = [
  { key: 'quiz', label: '答题' },
  { key: 'discussion', label: '讨论区' },
  { key: 'stats', label: '统计' },
  { key: 'feedback', label: '反馈' }
]
console.log('Sidebar items:', items)
</script>

<style scoped>
.sidebar,
.fixed-sidebar {
  width: 200px;
  background: #fff;
  border-right: 1px solid #eee;
  z-index: 10;
  box-shadow: 2px 0 8px rgba(60,120,200,0.04);
  display: flex;
  flex-direction: column;
  padding-top: 0;
}
.sidebar-item {
  padding: 1rem;
  cursor: pointer;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  transition: background 0.2s;
}
.sidebar-item.active, .sidebar-item:hover {
  background: #e0f7ef;
  color: #3eaf7c;
  font-weight: bold;
}
</style>