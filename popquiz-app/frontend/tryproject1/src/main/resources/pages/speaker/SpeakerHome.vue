<template>
  <div class="center-container">
    <div class="speaker-home-bg">
      <div class="speaker-home">
        <h2 class="speaker-title">讲座管理</h2>
        <button class="create-btn" @click="showCreate = true">+ 创建新讲座</button>
        <button class="create-btn" @click="toggleLectures">已有讲座</button>
        <div v-if="showLectures" class="lecture-list">
          <div v-for="lecture in lectures" :key="lecture.id" class="lecture-card">
            <router-link :to="`/speaker/lecture/${lecture.id}/upload`">
              <div class="lecture-title">{{ lecture.title }}</div>
              <div class="lecture-desc">{{ lecture.desc || '暂无简介' }}</div>
              <div class="lecture-speaker">主讲人：{{ lecture.speaker }}</div>
            </router-link>
            <button class="delete-btn" @click="deleteLecture(lecture.id)">删除</button>
          </div>
        </div>
        <div v-if="showCreate" class="modal-bg">
          <div class="modal">
            <h3>新建讲座</h3>
            <input v-model="newLecture.title" placeholder="讲座标题" />
            <input v-model="newLecture.desc" placeholder="讲座简介" />
            <input v-model="newLecture.speaker" placeholder="主讲人" />
            <div class="modal-actions">
              <button @click="createLecture">创建</button>
              <button @click="showCreate = false">取消</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const lectures = ref<{id: number, title: string, desc: string, speaker: string}[]>([])
const showCreate = ref(false)
const showLectures = ref(false)
const newLecture = ref({ title: '', desc: '', speaker: '' })

function toggleLectures() {
  showLectures.value = !showLectures.value
  if (showLectures.value && lectures.value.length === 0) {
    fetchLectures()
  }
}

async function fetchLectures() {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/lectures', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.ok) {
      const data = await res.json()
      lectures.value = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        desc: item.description ,
        speaker: item.name || ''
      }))
    }
  } catch (e) {}
}

onMounted(() => {
  // 默认不加载讲座列表
})

async function createLecture() {
  console.log('createLecture 被触发', newLecture.value)
  if (!newLecture.value.title || !newLecture.value.desc || !newLecture.value.speaker) {
    alert('讲座标题、简介和主讲人姓名均为必填！')
    console.log('表单未填全', newLecture.value)
    return
  }
  const token = localStorage.getItem('token')
  console.log('token', token)
  if (!token) {
    alert('请先登录！')
    return
  }
  let payload: any = null
  try {
    payload = JSON.parse(atob(token.split('.')[1]))
  } catch (e) { console.log('token 解析失败', e) }
  console.log('payload', payload)
  if (!payload || payload.role !== 'speaker') {
    alert('只有讲者可以创建讲座！')
    return
  }
  try {
    console.log('准备发起POST请求', {
      title: newLecture.value.title,
      description: newLecture.value.desc,
      name: newLecture.value.speaker
    })
    const res = await fetch('/api/lectures/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: newLecture.value.title,
        description: newLecture.value.desc,
        name: newLecture.value.speaker
      })
    })
    const data = await res.json()
    console.log('后端响应', res.status, data)
    if (res.ok && data.lecture) {
      showCreate.value = false
      await fetchLectures()
      router.push(`/speaker/lecture/${data.lecture.id}/upload`)
      newLecture.value = { title: '', desc: '', speaker: '' }
    } else {
      alert(data.error || '创建失败')
    }
  } catch (e) {
    alert('网络错误')
    console.log('请求异常', e)
  }
}

async function deleteLecture(id: number) {
  if (!confirm('确定要删除该讲座吗？')) return
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`/api/lectures/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (res.ok) {
      await fetchLectures()
    } else {
      alert(data.error || '删除失败')
    }
  } catch (e) {
    alert('网络错误')
  }
}
</script>
<style scoped>
.center-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* 顶部对齐 */
  align-items: center;
  min-height: 80vh;
  /* padding-top: 40px;  // 去掉或设为0 */
}
.center-container > * {
  width: 80%;
  max-width: 600px;
  font-size: 1.2rem;
}
.speaker-home-bg {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f7fa 0%, #f6fcfa 100%);
  overflow-x: hidden;
  margin-top: 20px; /* 或者 4rem */
}
.speaker-home {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 4px solid #a8e6cf;
  border-radius: 32px;
  background: rgba(255,255,255,0.95);
  margin: 0 auto; /* 移除 margin-top */
  padding: 0 0 48px 0; /* 移除 padding-top */
  width: 90vw;
  max-width: 500px;
  min-width: 260px;
  box-sizing: border-box;
  box-shadow: 0 8px 32px rgba(64,158,255,0.08), 0 1.5px 8px rgba(168,230,207,0.10);
  transition: box-shadow 0.2s;
}
.speaker-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #2d8c7f;
  margin-bottom: 32px;
  letter-spacing: 2px;
  text-align: center;
}
.create-btn {
  margin-bottom: 24px;
  padding: 10px 32px;
  background: #26c6da;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
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
  cursor: pointer;
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
}
.lecture-card a {
  text-decoration: none;
  color: inherit;
  width: 100%;
  display: block;
}
.modal-bg {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(44,209,171,0.13);
  padding: 32px 24px;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}
.modal input {
  width: 220px;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1.5px solid #b2dfdb;
  font-size: 1rem;
}
.modal-actions {
  display: flex;
  gap: 18px;
  margin-top: 12px;
}
.modal-actions button {
  background: #26c6da;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 7px 18px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
}
.delete-btn {
  margin-top: 10px;
  background: #ff5252;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
}
.delete-btn:hover {
  background: #d32f2f;
}
@media (max-width: 600px) {
  .speaker-home {
    padding: 24px 0 24px 0;
    max-width: 98vw;
    border-radius: 18px;
  }
  .lecture-card {
    padding: 20px 8px;
    border-radius: 12px;
  }
  .speaker-title {
    font-size: 1.3rem;
    margin-bottom: 18px;
  }
}
</style> 