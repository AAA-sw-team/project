<template>
  <div>
    <h4>讨论区</h4>
    <div v-for="comment in comments" :key="comment.id">
      <p>{{ comment.user }}: {{ comment.text }}</p>
    </div>
    <form @submit.prevent="addComment">
      <input v-model="newComment" placeholder="发表评论..." />
      <button type="submit">发送</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue'
import axios from 'axios'
const props = defineProps({ quizId: [String, Number] })
const comments = ref([])
const newComment = ref('')

onMounted(async () => {
  if (props.quizId) {
    const res = await axios.get(`/api/quiz/${props.quizId}/comments`)
    comments.value = res.data.comments
  }
})

const addComment = async () => {
  if (!newComment.value) return
  await axios.post(`/api/quiz/${props.quizId}/comments`, { text: newComment.value })
  comments.value.push({ user: '我', text: newComment.value, id: Date.now() })
  newComment.value = ''
}
</script>
