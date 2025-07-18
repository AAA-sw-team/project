<template>
  <div class="organizer-home-bg">
    <div class="organizer-home">
      <h2 class="organizer-title">讲座管理</h2>
      <button class="add-lecture-btn" @click="showAddForm = true">新增讲座</button>
      <div class="lecture-list">
        <div v-for="lecture in lectures" :key="lecture.id" class="lecture-card">
          <div class="lecture-title">{{ lecture.title }}</div>
          <div class="lecture-actions">
            <button @click="viewLecture(lecture.id)">查看</button>
            <button @click="editLecture(lecture)">编辑</button>
            <button @click="deleteLecture(lecture.id)">删除</button>
          </div>
        </div>
      </div>
      <!-- 新增/编辑讲座弹窗 -->
      <div v-if="showAddForm || editingLecture" class="modal-bg">
        <div class="modal">
          <h3>{{ editingLecture ? '编辑讲座' : '新增讲座' }}</h3>
          <form @submit.prevent="submitLecture">
            <input v-model="form.title" placeholder="讲座标题" required />
            <div class="modal-actions">
              <button type="submit">保存</button>
              <button type="button" @click="closeForm">取消</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const lectures = ref<{id: number, title: string}[]>([])
const showAddForm = ref(false)
const editingLecture = ref<{id: number, title: string} | null>(null)
const form = ref<{title: string}>({ title: '' })

onMounted(() => {
  // 实际应调用API，这里用静态数据
  lectures.value = [
    { id: 1, title: 'Vue3 响应式原理' },
    { id: 2, title: 'JavaScript 进阶' }
  ]
})

function viewLecture(id: number) {
  router.push(`/organizer/lectures/${id}`)
}
function editLecture(lecture: {id: number, title: string}) {
  editingLecture.value = { ...lecture }
  form.value.title = lecture.title
}
function deleteLecture(id: number) {
  lectures.value = lectures.value.filter(l => l.id !== id)
}
function submitLecture() {
  if (editingLecture.value) {
    // 编辑
    const idx = lectures.value.findIndex(l => l.id === editingLecture.value!.id)
    if (idx !== -1) lectures.value[idx].title = form.value.title
    editingLecture.value = null
  } else {
    // 新增
    const newId = lectures.value.length ? Math.max(...lectures.value.map(l => l.id)) + 1 : 1
    lectures.value.push({ id: newId, title: form.value.title })
  }
  form.value.title = ''
  showAddForm.value = false
}
function closeForm() {
  showAddForm.value = false
  editingLecture.value = null
  form.value.title = ''
}
</script>
<style scoped>
.organizer-home-bg {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f7fa 0%, #f6fcfa 100%);
  overflow-x: hidden;
}
.organizer-home {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 4px solid #a8e6cf;
  border-radius: 32px;
  background: rgba(255,255,255,0.95);
  margin: 48px auto;
  padding: 48px 0 48px 0;
  width: 90vw;
  max-width: 500px;
  min-width: 260px;
  box-sizing: border-box;
  box-shadow: 0 8px 32px rgba(64,158,255,0.08), 0 1.5px 8px rgba(168,230,207,0.10);
  transition: box-shadow 0.2s;
}
.organizer-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #2d8c7f;
  margin-bottom: 32px;
  letter-spacing: 2px;
  text-align: center;
}
.add-lecture-btn {
  margin-bottom: 24px;
  padding: 8px 24px;
  background: #26c6da;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s;
}
.add-lecture-btn:hover {
  background: #0097a7;
}
.lecture-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin-top: 0;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.lecture-card {
  width: 92%;
  max-width: 420px;
  margin: 0 auto;
  background: #f8fdfb;
  border: 2px solid #b2dfdb;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(44, 209, 171, 0.07);
  transition: box-shadow 0.22s, border-color 0.22s, transform 0.18s;
  padding: 32px 18px;
  text-align: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  will-change: transform, box-shadow;
}
.lecture-card:hover {
  border-color: #26c6da;
  box-shadow: 0 8px 32px rgba(44,209,171,0.13);
  transform: translateY(-4px) scale(1.025);
}
.lecture-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d8c7f;
  text-decoration: none;
  letter-spacing: 1px;
  margin-bottom: 16px;
}
.lecture-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.lecture-actions button {
  padding: 4px 14px;
  border: none;
  border-radius: 6px;
  background: #b2dfdb;
  color: #2d8c7f;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
}
.lecture-actions button:hover {
  background: #26c6da;
  color: #fff;
}
/* 弹窗样式 */
.modal-bg {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 4px 24px rgba(44,209,171,0.13);
  min-width: 260px;
  max-width: 90vw;
}
.modal-actions {
  display: flex;
  gap: 18px;
  margin-top: 18px;
  justify-content: flex-end;
}
@media (max-width: 600px) {
  .organizer-home {
    padding: 24px 0 24px 0;
    max-width: 98vw;
    border-radius: 18px;
  }
  .lecture-card {
    padding: 20px 8px;
    border-radius: 12px;
  }
  .organizer-title {
    font-size: 1.3rem;
    margin-bottom: 18px;
  }
}
</style> 
 