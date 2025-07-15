<template>
  <div class="quiz-card">
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
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
const props = defineProps({ quiz: Object, readonly: Boolean })
const emit = defineEmits(['submit'])
const selected = ref('')

const submit = () => {
  emit('submit', { quizId: props.quiz.id, answer: selected.value })
}
</script>