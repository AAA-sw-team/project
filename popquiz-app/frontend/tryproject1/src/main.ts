import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Login from './main/resources/pages/Login.vue'
import Register from './main/resources/pages/Register.vue'
import OrganizerHome from './main/resources/pages/OrganizerHome.vue'
import SpeakerIndex from './main/resources/pages/speaker/index.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/speaker', redirect: '/speaker/index' },
  { path: '/speaker/index', component: SpeakerIndex },
  { path: '/organizer', component: OrganizerHome }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

createApp(App).use(router).mount('#app')