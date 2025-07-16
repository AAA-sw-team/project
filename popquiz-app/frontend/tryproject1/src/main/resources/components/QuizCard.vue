<template>
  <div class="quiz-card">
<<<<<<< Updated upstream
    <div class="question-text">{{ question.text }}</div>
    <div class="options">
      <label v-for="(opt, idx) in options" :key="idx" class="option-item">
        <input type="radio" :value="opt" v-model="selected" />
        {{ opt }}
      </label>
    </div>
    <button :disabled="!selected" @click="submit">提交</button>
=======
    <h4>{{ quiz.question }}</h4>
    <ul>
      <li v-for="(opt, idx) in quiz.options" :key="idx">
        <label>
          <input type="radio" :name="quiz.id" :value="opt" v-model="selected" :disabled="readonly" />
          {{ opt }}
        </label>
      </li>
    </ul>
    <button v-if="!readonly" @click="submit">提交</button>
>>>>>>> Stashed changes
  </div>
</template>

<script setup lang="ts">
<<<<<<< Updated upstream
import { ref, watch } from 'vue'

const props = defineProps<{
  question: { text: string, id?: string },
  options: string[]
}>()
const emits = defineEmits(['submit'])

const selected = ref('')

watch(() => props.question, () => {
  // 题目切换时重置
  selected.value = ''
})

function submit() {
  emits('submit', selected.value)
}
</script>

<style scoped>
.quiz-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  background: #fff;
}
.question-text {
  font-size: 18px;
  margin-bottom: 16px;
}
.options {
  margin-bottom: 16px;
}
.option-item {
  display: block;
  margin-bottom: 8px;
}
button[disabled] {
  background: #ccc;
  cursor: not-allowed;
}
</style>
=======
import { ref, defineProps, defineEmits } from 'vue'
const props = defineProps({ quiz: Object, readonly: Boolean })
const emit = defineEmits(['submit'])
const selected = ref('')

const submit = () => {
  emit('submit', { quizId: props.quiz.id, answer: selected.value })
}
</script>
>>>>>>> Stashed changes
