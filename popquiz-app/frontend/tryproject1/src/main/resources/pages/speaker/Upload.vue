<template>
  <div class="upload-wrapper">
    <div class="header-section">
      <div class="title-icon animate-bounce">📄</div>
      <h2 class="upload-title animate-fade-in">智能题目生成器</h2>
      <p class="subtitle animate-fade-in-delay">上传新文件或选择已有文件，AI 为您生成专业题目</p>
    </div>
    
    <!-- 文件操作区域 -->
    <div class="file-operations animate-slide-up">
      <div class="operation-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'upload' }"
          @click="activeTab = 'upload'"
        >
          <span class="tab-icon">☁️</span>
          上传新文件
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'select' }"
          @click="activeTab = 'select'"
        >
          <span class="tab-icon">📂</span>
          选择已有文件
        </button>
      </div>
      
      <!-- 上传文件面板 -->
      <div v-show="activeTab === 'upload'" class="upload-panel">
        <label class="upload-label">
          <input type="file" class="upload-input" @change="handleFile" accept=".pdf,.ppt,.pptx,.txt,.mp3,.mp4" />
          <div class="upload-content">
            <div class="upload-icon">☁️</div>
            <span class="upload-text">点击上传文件</span>
            <span class="upload-desc">支持 PDF、PPT、文本、音频、视频等格式</span>
          </div>
        </label>
      </div>
      
      <!-- 选择文件面板 -->
      <div v-show="activeTab === 'select'" class="select-panel">
        <div class="select-content">
          <div class="select-header">
            <div class="select-icon">📂</div>
            <span class="select-text">从已上传文件中选择</span>
            <button class="refresh-btn" @click="loadUploadedFiles" title="刷新文件列表">
              <span class="refresh-icon">🔄</span>
            </button>
          </div>
          <button class="select-files-btn" @click="openFileSelector">
            <span class="btn-icon">📋</span>
            选择文件 ({{ selectedFiles.length }}个已选)
          </button>
        </div>
      </div>
    </div>

    <!-- 已选文件显示 -->
    <div v-if="selectedFiles.length > 0" class="selected-files-section animate-fade-in">
      <h4 class="selected-title">
        <span class="title-icon">📋</span>
        已选择文件 ({{ selectedFiles.length }}个)
      </h4>
      <div class="selected-files-list">
        <div v-for="file in selectedFiles" :key="file.id" class="selected-file-item">
          <span class="file-name">{{ file.original_name || file.filename }}</span>
          <button class="remove-file-btn" @click="removeSelectedFile(file.id)" title="移除文件">
            <span>✕</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮组 -->
    <div class="action-buttons animate-slide-up-delay">
      <button 
        class="main-btn generate-btn" 
        @click="generateQuiz" 
        :disabled="!hasSelectedFiles || isGenerating || isRegenerating"
      >
        <span class="btn-icon">{{ isGenerating ? '⏳' : '✨' }}</span>
        {{ isGenerating ? '正在生成...' : '生成题目' }}
      </button>
      <button 
        class="main-btn regenerate-btn" 
        @click="regenerateQuiz" 
        :disabled="!currentGroupId || !hasSelectedFiles || isGenerating || isRegenerating"
      >
        <span class="btn-icon">{{ isRegenerating ? '⏳' : '🔄' }}</span>
        {{ isRegenerating ? '正在重新生成...' : '重新生成' }}
      </button>
      <button 
        class="main-btn publish-btn" 
        @click="() => { console.log('发布按钮被点击了'); publishQuiz(); }" 
        :disabled="!quizzes || !quizzes.length || isGenerating || isRegenerating || isPublishing"
      >
        <span class="btn-icon">{{ isPublishing ? '⏳' : '🚀' }}</span>
        {{ isPublishing ? '正在发布...' : '发布题目' }}
      </button>
      <button 
        class="main-btn end-lecture-btn" 
        @click="endLecture"
        :disabled="isGenerating || isRegenerating || isPublishing || isEndingLecture"
      >
        <span class="btn-icon">{{ isEndingLecture ? '⏳' : '🔚' }}</span>
        {{ isEndingLecture ? '正在结束...' : '结束讲座' }}
      </button>
    </div>
    <div v-if="quizzes && quizzes.length" class="quiz-list-section animate-slide-up-delay">
      <div class="section-header">
        <div class="section-icon">🎯</div>
        <h3 class="quiz-list-title">AI 生成的题目 ({{ quizzes.length }})</h3>
      </div>
      <div class="quiz-bubble-list">
        <div v-for="(quiz, idx) in quizzes" :key="quiz && quiz.id ? quiz.id : idx" 
             class="quiz-bubble animate-quiz-item" 
             :style="{ animationDelay: `${idx * 0.1}s` }">
          <div class="bubble-header">
            <span class="question-number">题目 {{ idx + 1 }}</span>
            <div class="question-actions">
              <button class="action-btn edit-btn" title="编辑题目">✏️</button>
              <button class="action-btn delete-btn" title="删除题目" @click="deleteQuiz(quiz.id, idx)">🗑️</button>
            </div>
          </div>
          <div class="quiz-question">{{ quiz.question }}</div>
          <ul class="quiz-options">
            <li v-for="(opt, oidx) in quiz.options" :key="oidx" 
                :class="{ 'correct-option': isCorrectOption(quiz.correctOption, oidx) }">
              <span class="option-label">{{ String.fromCharCode(65 + oidx) }}.</span>
              <span class="option-text">{{ opt }}</span>
              <span v-if="isCorrectOption(quiz.correctOption, oidx)" 
                    class="correct-mark">✓ 正确</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- 文件选择弹窗 -->
    <div v-if="showFileSelector" class="file-selector-overlay" @click="closeFileSelector">
      <div class="file-selector-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <span class="modal-icon">📂</span>
            选择已上传的文件
          </h3>
          <button class="close-btn" @click="closeFileSelector">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner">⏳</div>
            <p>加载文件列表中...</p>
          </div>
          <div v-else-if="uploadedFiles.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <p>该讲座暂无已上传的文件</p>
          </div>
          <div v-else class="files-list">
            <div v-for="file in uploadedFiles" :key="file.id" class="file-item">
              <label class="file-checkbox-label">
                <input 
                  type="checkbox" 
                  :value="file.id" 
                  v-model="tempSelectedFileIds"
                  class="file-checkbox"
                />
                <div class="file-info">
                  <div class="file-icon">📄</div>
                  <div class="file-details">
                    <span class="file-name">{{ file.original_name || file.filename }}</span>
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                    <span class="file-date">{{ formatDate(file.created_at) }}</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeFileSelector">取消</button>
          <button class="confirm-btn" @click="confirmFileSelection" :disabled="tempSelectedFileIds.length === 0">
            确认选择 ({{ tempSelectedFileIds.length }}个)
          </button>
        </div>
      </div>
    </div>
    
    <!-- 通知组件 - 独立容器 -->
    <teleport to="body">
      <div v-if="notification.show" 
           class="notification" 
           :class="[`notification-${notification.type}`]">
        <div class="notification-content">
          <span class="notification-icon">
            {{ notification.type === 'success' ? '✅' : '❌' }}
          </span>
          <span class="notification-message">{{ notification.message }}</span>
        </div>
      </div>
    </teleport>
    
    <!-- 生成题目时的遮罩层 -->
    <div v-if="isGenerating || isRegenerating" class="generating-overlay">
      <div class="generating-modal">
        <div class="generating-content">
          <div class="generating-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ai-icon">🤖</div>
          </div>
          <h3 class="generating-title">
            {{ isGenerating ? 'AI 正在生成题目' : 'AI 正在重新生成题目' }}
          </h3>
          <p class="generating-desc">
            请稍候，AI 正在分析您的文件内容并生成高质量的题目...
          </p>
          <div class="generating-progress">
            <div class="progress-dots">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'

interface Quiz {
  id: string | number
  question: string
  options: string[]
  correctOption?: string
}

interface UploadedFile {
  id: string | number
  filename: string
  original_name?: string
  size?: number
  created_at?: string
}

const quizzes = ref([])
const fileId = ref('')
const route = useRoute()
const router = useRouter()
const lectureId = route.params.id

// 新增状态
const activeTab = ref('upload')
const selectedFiles = ref<UploadedFile[]>([])
const uploadedFiles = ref<UploadedFile[]>([])
const showFileSelector = ref(false)
const tempSelectedFileIds = ref<(string | number)[]>([])
const loading = ref(false)

// 添加用于存储当前题目组的group_id
const currentGroupId = ref('')
const quizIds = ref<number[]>([])

// 添加生成题目的加载状态
const isGenerating = ref(false)
const isRegenerating = ref(false)

// 添加发布题目的加载状态
const isPublishing = ref(false)

// 添加结束讲座的加载状态  
const isEndingLecture = ref(false)

// 添加通知状态
const notification = ref({
  show: false,
  message: '',
  type: 'success' // success, error
})

// 计算属性
const hasSelectedFiles = computed(() => {
  return fileId.value || selectedFiles.value.length > 0
})

function getAuthHeader() {
  const token = localStorage.getItem('token') || ''
  if (!token) return {}
  return {
    Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
  }
}

// 显示通知
const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  console.log('showNotification调用:', { message, type })
  notification.value = { show: true, message, type }
  console.log('notification.value设置为:', notification.value)
  
  // 根据消息长度调整显示时间，最少3秒，最多8秒
  const displayTime = Math.min(Math.max(message.length * 80, 3000), 8000)
  console.log('通知显示时间:', displayTime + 'ms')
  
  setTimeout(() => {
    console.log('隐藏通知')
    notification.value.show = false
  }, displayTime)
}

// 判断是否为正确选项
const isCorrectOption = (correctOption: string | undefined, optionIndex: number) => {
  if (!correctOption) return false
  
  // 将选项索引转换为字母 (0->A, 1->B, 2->C, 3->D)
  const optionLetter = String.fromCharCode(65 + optionIndex)
  
  // 处理各种可能的正确答案格式
  const normalizedCorrect = correctOption.toString().toUpperCase().trim()
  
  // 支持 "A", "B", "C", "D" 或者 "选项A", "选项B" 等格式
  return normalizedCorrect === optionLetter || 
         normalizedCorrect === `选项${optionLetter}` ||
         normalizedCorrect.endsWith(optionLetter)
}

// 上传文件
const handleFile = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  const token = localStorage.getItem('token')
  const uploadUrl = `/api/upload/${lectureId}`
  try {
    const res = await axios.post(uploadUrl, formData, {
      headers: {
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    fileId.value = res.data.file.id
    // 清空已选择的文件，因为用户上传了新文件
    selectedFiles.value = []
    showNotification('上传成功', 'success')
  } catch (err) {
    showNotification('上传失败，请检查 lectureId、token、接口路径和后端日志！', 'error')
  }
}

// 加载已上传的文件
const loadUploadedFiles = async () => {
  loading.value = true
  try {
    const res = await axios.get(`/api/files/${lectureId}`, {
      headers: getAuthHeader()
    })
    console.log('加载文件列表成功:', res.data)
    uploadedFiles.value = res.data.files || []
  } catch (err) {
    console.error('加载文件列表失败:', err)
    console.error('错误详情:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      url: `/api/files/${lectureId}`
    })
    showNotification('加载文件列表失败: ' + (err.response?.data?.error || err.message), 'error')
  } finally {
    loading.value = false
  }
}

// 加载现有题目
const loadExistingQuizzes = async () => {
  try {
    const res = await axios.get(`/api/quizzes/${lectureId}`, {
      headers: getAuthHeader()
    })
    
    if (res.data && res.data.length > 0) {
      // 获取最新的题目组
      const latestGroup = res.data.reduce((latest, current) => {
        return new Date(current.created_at) > new Date(latest.created_at) ? current : latest
      })
      
      // 获取同组的所有题目
      const groupQuizzes = res.data.filter(quiz => quiz.group_id === latestGroup.group_id)
      
      console.log('加载的现有题目:', groupQuizzes)
      
      quizzes.value = groupQuizzes.map(quiz => {
        // 确保正确答案格式统一
        let correctOption = quiz.correct_option
        if (correctOption) {
          // 提取字母部分 (A, B, C, D)
          const match = correctOption.toString().match(/[ABCD]/i)
          correctOption = match ? match[0].toUpperCase() : correctOption
        }
        
        console.log('现有题目:', quiz.question, '正确答案:', correctOption)
        
        return {
          id: quiz.id,
          question: quiz.question,
          options: [quiz.option_a, quiz.option_b, quiz.option_c, quiz.option_d],
          correctOption: correctOption
        }
      })
      currentGroupId.value = latestGroup.group_id
      quizIds.value = groupQuizzes.map(quiz => quiz.id)
    }
  } catch (err) {
    console.error('加载题目失败:', err)
  }
}

// 显示文件选择器
const openFileSelector = () => {
  showFileSelector.value = true
  tempSelectedFileIds.value = selectedFiles.value.map(f => f.id)
  loadUploadedFiles()
}

// 关闭文件选择器
const closeFileSelector = () => {
  showFileSelector.value = false
  tempSelectedFileIds.value = []
}

// 确认文件选择
const confirmFileSelection = () => {
  selectedFiles.value = uploadedFiles.value.filter(file => 
    tempSelectedFileIds.value.includes(file.id)
  )
  // 清空单独上传的文件ID，因为用户选择了文件列表
  fileId.value = ''
  closeFileSelector()
}

// 移除选中的文件
const removeSelectedFile = (fileId: string | number) => {
  selectedFiles.value = selectedFiles.value.filter(file => file.id !== fileId)
}

// 生成题目
const generateQuiz = async () => {
  const fileIds = getSelectedFileIds()
  if (fileIds.length === 0) return
  
  isGenerating.value = true
  
  try {
    const res = await axios.post(
      `/api/quizzes/generate/${lectureId}`,
      { file_ids: fileIds, count: 5 },
      { headers: getAuthHeader() }
    )
    
    // 根据后端返回结构更新数据
    if (res.data && res.data.data) {
      console.log('AI生成的题目数据:', res.data.data)
      
      quizzes.value = res.data.data.map((quiz, index) => {
        // 确保正确答案格式统一
        let correctOption = quiz.correct_option
        if (correctOption) {
          // 提取字母部分 (A, B, C, D)
          const match = correctOption.toString().match(/[ABCD]/i)
          correctOption = match ? match[0].toUpperCase() : 'A'
        } else {
          correctOption = 'A' // 默认值
        }
        
        // 验证选项完整性
        const options = [
          quiz.option_a || `选项A`,
          quiz.option_b || `选项B`,
          quiz.option_c || `选项C`,
          quiz.option_d || `选项D`
        ]
        
        console.log(`题目 ${index + 1}:`, {
          question: quiz.question,
          options,
          correctOption
        })
        
        return {
          id: quiz.id || Math.random().toString(),
          question: quiz.question || `题目 ${index + 1}`,
          options,
          correctOption
        }
      })
      currentGroupId.value = res.data.group_id || ''
      quizIds.value = res.data.quizIds || []
      showNotification('题目生成成功！', 'success')
    }
  } catch (err) {
    console.error('生成题目失败:', err)
    console.error('错误详情:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    })
    
    let errorMessage = '生成题目失败'
    if (err.response?.data?.detail) {
      errorMessage += ': ' + err.response.data.detail
    } else if (err.response?.data?.error) {
      errorMessage += ': ' + err.response.data.error
    } else {
      errorMessage += ': ' + (err.message || '未知错误')
    }
    
    showNotification(errorMessage, 'error')
  } finally {
    isGenerating.value = false
  }
}

// 重新生成题目
const regenerateQuiz = async () => {
  const fileIds = getSelectedFileIds()
  if (fileIds.length === 0) return
  
  if (!currentGroupId.value) {
    showNotification('请先生成题目后再使用重新生成功能', 'error')
    return
  }
  
  if (!confirm('确定要重新生成题目吗？这将替换当前的题目。')) {
    return
  }
  
  isRegenerating.value = true
  
  try {
    const res = await axios.post(
      `/api/quizzes/${lectureId}/quizzes/regenerate`,
      { 
        group_id: currentGroupId.value,
        file_ids: fileIds, 
        count: 5 
      },
      { headers: getAuthHeader() }
    )
    
    // 根据后端返回结构更新数据
    if (res.data && res.data.data) {
      console.log('AI重新生成的题目数据:', res.data.data)
      
      quizzes.value = res.data.data.map((quiz, index) => {
        // 确保正确答案格式统一
        let correctOption = quiz.correct_option
        if (correctOption) {
          // 提取字母部分 (A, B, C, D)
          const match = correctOption.toString().match(/[ABCD]/i)
          correctOption = match ? match[0].toUpperCase() : 'A'
        } else {
          correctOption = 'A' // 默认值
        }
        
        // 验证选项完整性
        const options = [
          quiz.option_a || `选项A`,
          quiz.option_b || `选项B`,
          quiz.option_c || `选项C`,
          quiz.option_d || `选项D`
        ]
        
        console.log(`重新生成题目 ${index + 1}:`, {
          question: quiz.question,
          options,
          correctOption
        })
        
        return {
          id: quiz.id || Math.random().toString(),
          question: quiz.question || `题目 ${index + 1}`,
          options,
          correctOption
        }
      })
      currentGroupId.value = res.data.group_id || ''
      quizIds.value = res.data.quizIds || []
      showNotification('题目重新生成成功！', 'success')
    }
  } catch (err) {
    console.error('重新生成题目失败:', err)
    console.error('错误详情:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    })
    
    let errorMessage = '重新生成题目失败'
    if (err.response?.data?.detail) {
      errorMessage += ': ' + err.response.data.detail
    } else if (err.response?.data?.error) {
      errorMessage += ': ' + err.response.data.error
    } else {
      errorMessage += ': ' + (err.message || '未知错误')
    }
    
    showNotification(errorMessage, 'error')
  } finally {
    isRegenerating.value = false
  }
}

// 发布题目
const publishQuiz = async () => {
  console.log('点击了发布题目按钮')
  console.log('当前数据状态:', {
    quizzesLength: quizzes.value.length,
    quizIdsLength: quizIds.value.length,
    lectureId: lectureId,
    quizIds: quizIds.value
  })
  
  if (!quizzes.value.length || !quizIds.value.length) {
    showNotification('❌ 没有可发布的题目，请先生成题目', 'error')
    return
  }
  
  // 确认发布
  if (!confirm(`确定要发布这 ${quizzes.value.length} 道题目吗？发布后听众将能看到并回答这些题目。`)) {
    return
  }
  
  isPublishing.value = true
  console.log('开始发布题目，请求URL:', `/api/quizzes/publish/${lectureId}`)
  console.log('请求数据:', { quiz_ids: quizIds.value })
  
  try {
    const response = await axios.post(`/api/quizzes/publish/${lectureId}`, { 
      quiz_ids: quizIds.value 
    }, {
      headers: getAuthHeader()
    })
    
    console.log('发布成功，响应:', response.data)
    
    // 显示详细的成功消息
    showNotification(
      `🎉 题目发布成功！已成功发布 ${quizzes.value.length} 道题目，听众现在可以开始答题了！`, 
      'success'
    )
    
    // 可选：显示额外的成功信息
    setTimeout(() => {
      showNotification('💡 您可以在统计页面查看答题情况', 'success')
    }, 2000)
    
  } catch (err) {
    console.error('发布题目失败:', err)
    console.error('错误详情:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      url: `/api/quizzes/publish/${lectureId}`,
      requestData: { quiz_ids: quizIds.value }
    })
    
    // 根据错误类型显示不同的错误消息
    let errorMessage = '❌ 发布题目失败'
    let detailMessage = ''
    
    if (err.response) {
      const status = err.response.status
      const data = err.response.data
      
      if (status === 401) {
        errorMessage = '❌ 发布失败：请重新登录'
        detailMessage = '您的登录已过期，请刷新页面重新登录后再试'
      } else if (status === 403) {
        errorMessage = '❌ 发布失败：权限不足'
        detailMessage = '您没有权限发布这些题目，请联系管理员'
      } else if (status === 404) {
        errorMessage = '❌ 发布失败：讲座不存在'
        detailMessage = '找不到指定的讲座，请检查讲座ID是否正确'
      } else if (status === 500) {
        errorMessage = '❌ 发布失败：服务器错误'
        detailMessage = '服务器内部错误，请稍后重试或联系技术支持'
      } else if (data?.detail) {
        errorMessage = `❌ 发布失败：${data.detail}`
      } else if (data?.error) {
        errorMessage = `❌ 发布失败：${data.error}`
      } else {
        errorMessage = `❌ 发布失败：HTTP ${status} 错误`
      }
    } else if (err.request) {
      errorMessage = '❌ 发布失败：网络连接错误'
      detailMessage = '无法连接到服务器，请检查网络连接后重试'
    } else {
      errorMessage = `❌ 发布失败：${err.message || '未知错误'}`
    }
    
    showNotification(errorMessage, 'error')
    
    // 如果有详细错误信息，延迟显示
    if (detailMessage) {
      setTimeout(() => {
        showNotification(`💡 ${detailMessage}`, 'error')
      }, 1500)
    }
  } finally {
    isPublishing.value = false
  }
}

// 结束讲座
const endLecture = async () => {
  if (!confirm('确定要结束讲座吗？结束后将无法继续操作，确认后将返回主页。')) {
    return
  }
  
  isEndingLecture.value = true
  
  try {
    console.log('正在结束讲座，lectureId:', lectureId)
    
    const response = await axios.post(`/api/lectures/${lectureId}/end`, {}, {
      headers: getAuthHeader()
    })
    
    console.log('结束讲座成功，响应:', response.data)
    console.log('即将显示成功通知')
    showNotification('🎊 讲座已成功结束！感谢您的精彩分享，即将返回主页...', 'success')
    console.log('成功通知已调用')
    
    // 延迟跳转，让用户看到提示
    setTimeout(() => {
      console.log('准备跳转到主页')
      router.push('/speaker/home')
    }, 2000)
    
  } catch (err) {
    console.error('结束讲座失败:', err)
    console.error('错误详情:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      url: `/api/lectures/${lectureId}/end`
    })
    
    let errorMessage = '❌ 结束讲座失败'
    let detailMessage = ''
    
    if (err.response) {
      const status = err.response.status
      const data = err.response.data
      
      if (status === 401) {
        errorMessage = '❌ 结束讲座失败：请重新登录'
        detailMessage = '您的登录已过期，请刷新页面重新登录后再试'
      } else if (status === 403) {
        errorMessage = '❌ 结束讲座失败：权限不足'
        detailMessage = '您只能结束自己创建的讲座'
      } else if (status === 404) {
        errorMessage = '❌ 结束讲座失败：讲座不存在'
        detailMessage = '找不到指定的讲座，请检查讲座ID是否正确'
      } else if (status === 500) {
        errorMessage = '❌ 结束讲座失败：服务器错误'
        detailMessage = '服务器内部错误，请稍后重试或联系技术支持'
      } else if (data?.detail) {
        errorMessage = `❌ 结束讲座失败：${data.detail}`
      } else if (data?.error) {
        errorMessage = `❌ 结束讲座失败：${data.error}`
      } else {
        errorMessage = `❌ 结束讲座失败：HTTP ${status} 错误`
      }
    } else if (err.request) {
      errorMessage = '❌ 结束讲座失败：网络连接错误'
      detailMessage = '无法连接到服务器，请检查网络连接后重试'
    } else {
      errorMessage = `❌ 结束讲座失败：${err.message || '未知错误'}`
    }
    
    showNotification(errorMessage, 'error')
    
    if (detailMessage) {
      setTimeout(() => {
        showNotification(`💡 ${detailMessage}`, 'error')
      }, 1500)
    }
  } finally {
    isEndingLecture.value = false
  }
}

// 删除单个题目
const deleteQuiz = async (quizId: string | number, index: number) => {
  if (!quizId) {
    // 如果没有ID，说明是刚生成还未保存的题目，直接从数组中移除
    quizzes.value.splice(index, 1)
    return
  }
  
  if (!confirm('确定要删除这道题目吗？')) {
    return
  }
  
  try {
    await axios.delete(`/api/quizzes/${quizId}`, {
      headers: getAuthHeader()
    })
    
    // 从本地数组中移除
    quizzes.value.splice(index, 1)
    
    // 从quizIds数组中移除
    const quizIdIndex = quizIds.value.indexOf(Number(quizId))
    if (quizIdIndex > -1) {
      quizIds.value.splice(quizIdIndex, 1)
    }
    
    showNotification('题目已删除', 'success')
  } catch (err) {
    console.error('删除题目失败:', err)
    showNotification('删除题目失败，请检查后端日志', 'error')
  }
}

// 获取选中的文件ID列表
const getSelectedFileIds = () => {
  if (fileId.value) {
    return [fileId.value]
  }
  return selectedFiles.value.map(file => file.id)
}

// 格式化文件大小
const formatFileSize = (size: number | undefined) => {
  if (!size) return '未知大小'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${Math.round(size / (1024 * 1024))} MB`
}

// 格式化日期
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '未知时间'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 开始讲座（自动调用）
const startLecture = async () => {
  try {
    console.log('正在开始讲座，lectureId:', lectureId)
    
    const response = await axios.post(`/api/lectures/${lectureId}/start`, {}, {
      headers: getAuthHeader()
    })
    
    console.log('讲座已开始，响应:', response.data)
    showNotification('🎉 讲座已开始！您现在可以上传文件并生成题目了', 'success')
    
  } catch (err) {
    console.error('开始讲座失败:', err)
    
    // 如果讲座已经在进行中或已结束，不显示错误
    if (err.response?.status === 400) {
      const errorMsg = err.response.data?.error
      if (errorMsg?.includes('已经在进行中')) {
        console.log('讲座已经在进行中，继续管理')
        return
      } else if (errorMsg?.includes('已经结束')) {
        showNotification('⚠️ 此讲座已结束，您只能查看内容，无法进行编辑', 'error')
        return
      }
    }
    
    console.error('开始讲座错误详情:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      url: `/api/lectures/${lectureId}/start`
    })
    
    // 其他错误情况显示提示但不阻止用户继续使用
    showNotification('⚠️ 开始讲座时出现问题，但您仍可以继续管理讲座内容', 'error')
  }
}

// 组件挂载时加载文件列表和现有题目
onMounted(() => {
  // 先开始讲座
  startLecture()
  // 然后加载其他数据
  loadUploadedFiles()
  loadExistingQuizzes()
})
</script>

<style scoped>
/* 容器样式 */
.upload-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.8rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(16, 163, 127, 0.12);
  border: 1px solid rgba(16, 163, 127, 0.1);
  position: relative;
  overflow: hidden;
}

.upload-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #10a37f 0%, #059669 50%, #047857 100%);
  z-index: 1;
}

/* 头部区域 */
.header-section {
  text-align: center;
  margin-bottom: 2.5rem;
}

.title-icon {
  font-size: 2.8rem;
  margin-bottom: 0.8rem;
  filter: drop-shadow(0 3px 6px rgba(16, 163, 127, 0.2));
}

.upload-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #10a37f;
  margin-bottom: 0.4rem;
  letter-spacing: 0.3px;
  text-shadow: 0 1px 3px rgba(16, 163, 127, 0.1);
}

.subtitle {
  font-size: 1rem;
  color: #047857;
  margin: 0;
  font-weight: 500;
  opacity: 0.8;
}

/* 上传区域 */
.file-operations {
  margin-bottom: 2rem;
}

.operation-tabs {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1.8rem;
  justify-content: center;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.8rem 1.6rem;
  border: 2px solid #10a37f;
  border-radius: 10px;
  background: transparent;
  color: #10a37f;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.tab-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(16, 163, 127, 0.1), transparent);
  transition: left 0.5s;
}

.tab-btn:hover::before {
  left: 100%;
}

.tab-btn.active {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 3px 12px rgba(16, 163, 127, 0.3);
}

.tab-icon {
  font-size: 1.1rem;
}

.upload-panel,
.select-panel {
  border-radius: 12px;
  overflow: hidden;
}

.upload-area {
  margin-bottom: 0;
}

.upload-label {
  display: block;
  cursor: pointer;
}

.upload-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.2rem 1.8rem;
  border: 2px dashed #10a37f;
  border-radius: 12px;
  background: rgba(16, 163, 127, 0.04);
  transition: all 0.3s ease;
  text-align: center;
}

.upload-content:hover {
  border-color: #047857;
  background: rgba(16, 163, 127, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 163, 127, 0.15);
}

.upload-icon {
  font-size: 2.5rem;
  margin-bottom: 0.8rem;
  animation: float 3s ease-in-out infinite;
}

.upload-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #10a37f;
  margin-bottom: 0.4rem;
}

/* 选择文件面板 */
.select-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.2rem 1.8rem;
  border: 2px dashed #10a37f;
  border-radius: 12px;
  background: rgba(16, 163, 127, 0.04);
  transition: all 0.3s ease;
  text-align: center;
}

.select-content:hover {
  border-color: #047857;
  background: rgba(16, 163, 127, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 163, 127, 0.15);
}

.select-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.2rem;
}

.select-icon {
  font-size: 2.5rem;
  animation: float 3s ease-in-out infinite;
}

.select-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #10a37f;
}

.refresh-btn {
  background: none;
  border: 2px solid #10a37f;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #10a37f;
}

.refresh-btn:hover {
  background: #10a37f;
  color: white;
  transform: rotate(180deg);
}

.refresh-icon {
  font-size: 1.1rem;
}

.select-files-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: white;
  box-shadow: 0 3px 12px rgba(16, 163, 127, 0.25);
}

.select-files-btn:hover {
  background: linear-gradient(135deg, #0e8c6b 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(16, 163, 127, 0.35);
}

/* 已选文件区域 */
.selected-files-section {
  margin-bottom: 1.5rem;
  padding: 1.2rem;
  background: rgba(16, 163, 127, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(16, 163, 127, 0.2);
}

.selected-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #10a37f;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
}

.title-icon {
  font-size: 1.1rem;
}

.selected-files-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.selected-file-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 0.8rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(16, 163, 127, 0.2);
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(16, 163, 127, 0.1);
  transition: all 0.2s ease;
}

.selected-file-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(16, 163, 127, 0.12);
}

.file-name {
  color: #047857;
  font-weight: 500;
  font-size: 0.85rem;
}

.remove-file-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 3px;
  transition: all 0.2s ease;
  font-weight: bold;
  font-size: 0.85rem;
}

.remove-file-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  transform: scale(1.05);
}

/* 操作按钮组 */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 2rem;
}

.main-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1.8rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  justify-content: center;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}

.main-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.main-btn:hover::before {
  left: 100%;
}

.generate-btn {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: white;
}

.generate-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0e8c6b 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 163, 127, 0.3);
}

.regenerate-btn {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
}

.regenerate-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(14, 165, 233, 0.3);
}

.publish-btn {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
  position: relative;
}

.publish-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #047857 0%, #065f46 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3);
}

/* 发布状态的特殊动画 */
.publish-btn:disabled {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  cursor: wait;
  position: relative;
  overflow: hidden;
}

.publish-btn:disabled::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: publishingShimmer 1.5s ease-in-out infinite;
}

.end-lecture-btn {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
}

.end-lecture-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);
}

.main-btn:disabled {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-icon {
  font-size: 1.1rem;
}

/* 文件选择弹窗 */
.file-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

.file-selector-modal {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(16, 163, 127, 0.2);
  border: 1px solid rgba(16, 163, 127, 0.1);
  max-width: 600px;
  width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid rgba(16, 163, 127, 0.1);
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #10a37f;
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
}

.modal-icon {
  font-size: 1.6rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  transform: scale(1.1);
}

.modal-body {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2.5rem 1.5rem;
  color: #6b7280;
}

.loading-spinner {
  font-size: 2.5rem;
  margin-bottom: 0.8rem;
  animation: spin 1s linear infinite;
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 0.8rem;
  opacity: 0.6;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.file-item {
  border: 2px solid rgba(16, 163, 127, 0.1);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: #ffffff;
}

.file-item:hover {
  border-color: rgba(16, 163, 127, 0.3);
  box-shadow: 0 3px 12px rgba(16, 163, 127, 0.08);
}

.file-checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem;
  cursor: pointer;
  width: 100%;
}

.file-checkbox {
  width: 20px;
  height: 20px;
  accent-color: #10a37f;
  cursor: pointer;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.file-icon {
  font-size: 2rem;
  color: #10a37f;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
}

.file-size {
  font-size: 0.85rem;
  color: #6b7280;
}

.file-date {
  font-size: 0.8rem;
  color: #9ca3af;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 2px solid rgba(16, 163, 127, 0.1);
  background: #f9fafb;
  justify-content: flex-end;
}

.cancel-btn,
.confirm-btn {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.cancel-btn {
  background: #e5e7eb;
  color: #374151;
}

.cancel-btn:hover {
  background: #d1d5db;
  transform: translateY(-1px);
}

.confirm-btn {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0e8c6b 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 3px 12px rgba(16, 163, 127, 0.25);
}

.confirm-btn:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

/* 通知组件样式 */
.notification {
  position: fixed !important;
  top: 20px !important;
  right: 20px !important;
  z-index: 99999 !important;
  min-width: 320px;
  max-width: 450px;
  padding: 1.2rem 1.8rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  animation: slideInRight 0.3s ease-out;
  border: 1px solid transparent;
  word-wrap: break-word;
  line-height: 1.5;
  pointer-events: auto !important;
  transform: translateZ(999px) !important;
  isolation: isolate;
}

.notification-success {
  background: linear-gradient(135deg, rgba(16, 163, 127, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%);
  border-color: rgba(16, 163, 127, 0.3);
  color: white;
}

.notification-error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%);
  border-color: rgba(239, 68, 68, 0.3);
  color: white;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.notification-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.notification-message {
  font-weight: 500;
  line-height: 1.4;
}

/* 生成题目时的遮罩层样式 */
.generating-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(12px);
  animation: fadeIn 0.3s ease-out;
}

.generating-modal {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(16, 163, 127, 0.3);
  border: 2px solid rgba(16, 163, 127, 0.2);
  padding: 3rem 2.5rem;
  max-width: 420px;
  width: 90vw;
  text-align: center;
  animation: slideUp 0.4s ease-out;
  position: relative;
  overflow: hidden;
}

.generating-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #10a37f 0%, #059669 50%, #047857 100%);
}

.generating-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.generating-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 0.5rem;
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 4px solid rgba(16, 163, 127, 0.2);
  border-top: 4px solid #10a37f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-ai-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  animation: pulse 2s ease-in-out infinite;
}

.generating-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #10a37f;
  margin: 0;
  letter-spacing: 0.3px;
}

.generating-desc {
  font-size: 1rem;
  color: #047857;
  margin: 0;
  line-height: 1.6;
  opacity: 0.9;
}

.generating-progress {
  margin-top: 1rem;
}

.progress-dots {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.dot {
  width: 8px;
  height: 8px;
  background: #10a37f;
  border-radius: 50%;
  animation: dotPulse 1.5s ease-in-out infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

/* 提示区域 */
.tip-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(16, 163, 127, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(16, 163, 127, 0.2);
  margin-bottom: 2rem;
}

.tip {
  color: #047857;
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  text-align: center;
}

/* 题目列表区域 */
.quiz-list-section {
  margin-top: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.section-icon {
  font-size: 2rem;
}

.quiz-list-title {
  color: #10a37f;
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
  text-align: center;
}

.quiz-bubble-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.quiz-bubble {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(16, 163, 127, 0.1);
  padding: 1.5rem;
  border: 1px solid rgba(16, 163, 127, 0.15);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.quiz-bubble::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #10a37f 0%, #059669 100%);
}

.quiz-bubble:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(16, 163, 127, 0.2);
}

.bubble-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(16, 163, 127, 0.1);
}

.question-number {
  font-size: 1.1rem;
  color: #10a37f;
  font-weight: 700;
}

.question-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  transform: scale(1.1);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  transform: scale(1.1);
}

.quiz-question {
  font-size: 1.2rem;
  color: #1f2937;
  margin-bottom: 1rem;
  font-weight: 600;
  line-height: 1.5;
}

.quiz-options {
  list-style: none;
  padding: 0;
  margin: 0;
}

.quiz-options li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid rgba(16, 163, 127, 0.1);
  transition: all 0.2s ease;
}

.quiz-options li:hover {
  background: rgba(16, 163, 127, 0.05);
  border-color: rgba(16, 163, 127, 0.2);
}

.quiz-options li.correct-option {
  background: linear-gradient(135deg, rgba(16, 163, 127, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
  border-color: #10a37f;
  box-shadow: 0 2px 8px rgba(16, 163, 127, 0.1);
}

.option-label {
  font-weight: 700;
  color: #10a37f;
  min-width: 24px;
}

.option-text {
  flex: 1;
  color: #374151;
  font-weight: 500;
}

.correct-mark {
  color: #10a37f;
  font-weight: 700;
  font-size: 0.9rem;
  background: rgba(16, 163, 127, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes quizItemSlide {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes dotPulse {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.8;
  }
}

@keyframes publishingShimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 应用动画 */
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

.animate-fade-in-delay {
  animation: fadeIn 0.8s ease-out 0.2s both;
}

.animate-fade-in-delay-2 {
  animation: fadeIn 0.8s ease-out 0.4s both;
}

.animate-slide-up {
  animation: slideUp 0.8s ease-out 0.3s both;
}

.animate-slide-up-delay {
  animation: slideUp 0.8s ease-out 0.6s both;
}

.animate-bounce {
  animation: bounce 2s infinite;
}

.animate-quiz-item {
  animation: quizItemSlide 0.6s ease-out both;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .action-buttons {
    gap: 0.8rem;
  }
  
  .main-btn {
    min-width: 130px;
    padding: 0.8rem 1.5rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 768px) {
  .upload-wrapper {
    padding: 1.5rem;
    margin: 1rem;
    max-height: none;
    overflow: visible;
  }
  
  .upload-title {
    font-size: 2rem;
  }
  
  .title-icon {
    font-size: 3rem;
  }
  
  .upload-content {
    padding: 2rem 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
  
  .main-btn {
    width: 100%;
    max-width: 280px;
    min-width: 200px;
    padding: 1rem 2rem;
    font-size: 1.1rem;
  }
  
  .quiz-bubble {
    padding: 1rem;
  }
  
  .bubble-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .question-actions {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .upload-wrapper {
    margin: 0.5rem;
    padding: 1rem;
    max-height: none;
    overflow: visible;
  }
  
  .upload-title {
    font-size: 1.8rem;
  }
  
  .section-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .quiz-options li {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .correct-mark {
    align-self: flex-end;
  }
  
  .file-selector-modal {
    width: 95vw;
    max-height: 90vh;
  }
  
  .modal-header {
    padding: 1rem 1.5rem;
  }
  
  .modal-title {
    font-size: 1.2rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .operation-tabs {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .tab-btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }
  
  .selected-files-list {
    flex-direction: column;
  }
  
  .selected-file-item {
    padding: 0.5rem 0.75rem;
  }
  
  .generating-modal {
    padding: 2rem 1.5rem;
    max-width: 350px;
  }
  
  .generating-title {
    font-size: 1.3rem;
  }
  
  .generating-desc {
    font-size: 0.9rem;
  }
  
  .generating-spinner {
    width: 60px;
    height: 60px;
  }
  
  .spinner-ai-icon {
    font-size: 1.5rem;
  }
  
  .notification {
    top: 10px !important;
    right: 10px !important;
    left: 10px !important;
    min-width: auto;
    max-width: none;
    z-index: 99999 !important;
    position: fixed !important;
    transform: translateZ(999px) !important;
    isolation: isolate;
  }
  
  .notification-message {
    font-size: 0.9rem;
  }
}
</style>

<style>
body {
  background: #f5f5f5;
}
</style> 