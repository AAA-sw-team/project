<template>
<<<<<<< Updated upstream
  <div>
    <div v-for="item in options" :key="item">
      <label>
        <input type="checkbox" :value="item" v-model="selected" />
        {{ item }}
      </label>
    </div>
    <textarea v-model="other" placeholder="其他建议"></textarea>
    <button @click="submit">提交反馈</button>
    <div v-if="submitted">感谢您的反馈！</div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
const props = defineProps<{ lectureId: string }>()
const options = [
  '讲得太快',
  '讲得太慢',
  '演讲本身太乏味',
  '题目出得质量不好'
]
const selected = ref<string[]>([])
const other = ref('')
const submitted = ref(false)

async function submit() {
  await axios.post(`/api/lectures/${props.lectureId}/feedback`, {
    options: selected.value,
    other: other.value
  })
  submitted.value = true
=======
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
>>>>>>> Stashed changes
}
</script>