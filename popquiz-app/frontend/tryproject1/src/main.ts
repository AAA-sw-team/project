import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Login from './main/resources/pages/Login.vue'
import Register from './main/resources/pages/Register.vue'
import ListenerHome from './main/resources/pages/ListenerHome.vue'
import SpeakerHome from './main/resources/pages/SpeakerHome.vue'
import OrganizerHome from './main/resources/pages/OrganizerHome.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/listener', component: ListenerHome },
  { path: '/speaker', component: SpeakerHome },
  { path: '/organizer', component: OrganizerHome }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

createApp(App).use(router).mount('#app')