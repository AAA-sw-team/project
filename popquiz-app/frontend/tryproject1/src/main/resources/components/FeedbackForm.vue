<template>
  <form @submit.prevent="submit">
    <label>反馈：</label>
    <select v-model="type" required>
      <option value="" disabled>请选择</option>
      <option value="fast">讲得太快</option>
      <option value="slow">讲得太慢</option>
      <option value="boring">太乏味</option>
      <option value="bad_question">题目质量不好</option>
    </select>
    <input v-model="comment" placeholder="补充说明（可选）" />
    <button type="submit">提交反馈</button>
  </form>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue'
const emit = defineEmits(['submit'])
const type = ref('')
const comment = ref('')
const submit = () => {
  emit('submit', { type: type.value, comment: comment.value })
  type.value = ''
  comment.value = ''
}
</script>