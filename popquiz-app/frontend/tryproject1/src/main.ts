
import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'

// 页面组件导入
import Login from './main/resources/pages/Login.vue'
import Register from './main/resources/pages/Register.vue'
import LectureList from './main/resources/pages/listener/LectureList.vue'
import LectureLayout from './main/resources/pages/listener/LectureLayout.vue'
import QuizPage from './main/resources/pages/listener/QuizPage.vue'
import ScorePage from './main/resources/pages/listener/ScorePage.vue'
import DiscussionPage from './main/resources/pages/listener/DiscussionPage.vue'
import FeedbackPage from './main/resources/pages/listener/FeedbackPage.vue'
import SpeakerIndex from './main/resources/pages/speaker/index.vue'
// 路由配置
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/lectures', component: LectureList },
  { path: '/speaker', redirect: '/speaker/index' },
  { path: '/speaker/index', component: SpeakerIndex },
  {
    path: '/lecture/:id',
    name: 'LectureLayout',
    component: () => import('./main/resources/pages/listener/LectureLayout.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

createApp(App).use(router).mount('#app')