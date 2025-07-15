<template>
  <div>
    <input type="file" @change="handleFile" />
    <div v-if="result">
      <h4>解析结果：</h4>
      <pre>{{ result }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue'
import axios from 'axios'
const emit = defineEmits(['uploaded'])
const result = ref('')
const handleFile = async (e: any) => {
  const file = e.target.files[0]
  const formData = new FormData()
  formData.append('file', file)
  const res = await axios.post('/api/upload', formData)
  result.value = res.data.text
  emit('uploaded', res.data.fileId)
}
</script>
