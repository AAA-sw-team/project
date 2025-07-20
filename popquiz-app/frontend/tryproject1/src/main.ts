
import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'

// 页面组件导入
import Login from './main/resources/pages/Login.vue'
import Register from './main/resources/pages/Register.vue'
import ListenerHome from './main/resources/pages/listener/ListenerHome.vue'
import LectureLayout from './main/resources/pages/listener/LectureLayout.vue'
import QuizPage from './main/resources/pages/listener/QuizPage.vue'
import ScorePage from './main/resources/pages/listener/ScorePage.vue'
import DiscussionPage from './main/resources/pages/listener/DiscussionPage.vue'
import FeedbackPage from './main/resources/pages/listener/FeedbackPage.vue'
import SpeakerIndex from './main/resources/pages/speaker/index.vue'
import OrganizerHome from './main/resources/pages/organizer/OrganizerHome.vue'
import OrganizerLectureLayout from './main/resources/pages/organizer/LectureLayout.vue'
import OrganizerScorePage from './main/resources/pages/organizer/ScorePage.vue'
import OrganizerDiscussionPage from './main/resources/pages/organizer/DiscussionPage.vue'
import OrganizerFeedbackPage from './main/resources/pages/organizer/FeedbackPage.vue'
import SpeakerHome from './main/resources/pages/speaker/SpeakerHome.vue'
import SpeakerLectureLayout from './main/resources/pages/speaker/LectureLayout.vue'
import SpeakerUpload from './main/resources/pages/speaker/Upload.vue'
import SpeakerStats from './main/resources/pages/speaker/Stats.vue'
import SpeakerDiscussion from './main/resources/pages/speaker/Discussion.vue'
import SpeakerFeedback from './main/resources/pages/speaker/Feedback.vue'

// 路由配置
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },

  { path: '/listener', redirect: '/listener/home' },
  { path: '/listener/home', component: ListenerHome },
  {
    path: '/listener/lecture/:id',
    component: LectureLayout,
    children: [
      { path: 'quiz', component: QuizPage },
      { path: 'score', component: ScorePage },
      { path: 'discussion', component: DiscussionPage },
      { path: 'feedback', component: FeedbackPage }
    ]
  },
  { path: '/speaker', component: SpeakerIndex },
  { path: '/speaker', redirect: '/speaker/index' },
  { path: '/speaker/index', component: SpeakerIndex },
  { path: '/speaker', redirect: '/speaker/home' },
  { path: '/speaker/home', component: SpeakerHome },
  {
    path: '/speaker/lecture/:id',
    component: SpeakerLectureLayout,
    children: [
      { path: '', redirect: 'upload' },
      { path: 'upload', component: SpeakerUpload },
      { path: 'stats', component: SpeakerStats },
      { path: 'discussion', component: SpeakerDiscussion },
      { path: 'feedback', component: SpeakerFeedback }
    ]
  },

  // organizer 路由
  { path: '/organizer', redirect: '/organizer/home' },
  { path: '/organizer/home', component: OrganizerHome },
  {
    path: '/organizer/lectures/:id',
    component: OrganizerLectureLayout,
    children: [
      { path: '', redirect: 'score' },
      { path: 'score', name: 'OrganizerScorePage', component: OrganizerScorePage },
      { path: 'discussion', component: OrganizerDiscussionPage },
      { path: 'feedback', component: OrganizerFeedbackPage }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

createApp(App).use(router).mount('#app')