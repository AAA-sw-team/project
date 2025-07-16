<template>
  <div>
<<<<<<< Updated upstream
    <div v-if="question">
      <div>题目：{{ question?.text }}</div>
      <div>选项：{{ question?.options?.join('、') }}</div>
    </div>
    <div>
      <div v-for="msg in messages" :key="msg.id">
        <b>{{ msg.user }}:</b> {{ msg.content }}
      </div>
      <input v-model="input" @keyup.enter="send" placeholder="输入评论..." />
      <button @click="send">发送</button>
    </div>
=======
    <h4>讨论区</h4>
    <div v-for="comment in comments" :key="comment.id">
      <p>{{ comment.user }}: {{ comment.text }}</p>
    </div>
    <form @submit.prevent="addComment">
      <input v-model="newComment" placeholder="发表评论..." />
      <button type="submit">发送</button>
    </form>
>>>>>>> Stashed changes
  </div>
</template>

<script setup lang="ts">
<<<<<<< Updated upstream
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

interface Question {
  id: number
  text: string
  options: string[]
}
interface Message {
  id: number
  user: string
  content: string
}

const route = useRoute()
const lectureId = route.params.id
const questionId = ref(null)
const question = ref<Question | null>(null)
const messages = ref<Message[]>([])
const input = ref('')

onMounted(async () => {
  // 获取当前题目
  const res = await axios.get(`/api/lectures/${lectureId}/current-question`)
  question.value = res.data
  questionId.value = res.data.id
  await loadMessages() // 等待 questionId 赋值后再加载消息
})

async function loadMessages() {
  if (!questionId.value) return
  const res = await axios.get(`/api/questions/${questionId.value}/discussion`)
  messages.value = res.data
}

async function send() {
  if (!input.value) return
  await axios.post(`/api/questions/${questionId.value}/discussion`, {
    content: input.value
  })
  input.value = ''
  loadMessages()
=======
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
>>>>>>> Stashed changes
}
</script>
