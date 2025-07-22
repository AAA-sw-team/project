<template>
  <div id="app">
    <header>
      <h1>PQ智能系统</h1>
    </header>
    <component :is="isLectureLayout ? 'div' : 'main'">
      <router-view />
    </component>
    <footer>
      <small>© 2024 PQ PopQuiz Web</small>
    </footer>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const isLectureLayout = route.path.startsWith('/lecture/')
</script>

<style>
#app {
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #f7f7f7;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
header {
  background: #3eaf7c;
  color: #fff;
  padding: 1rem 0;
  text-align: center;
  width: 100%;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
}
main {
  flex: 1;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
  margin-top: 64px; /* header高度 */
}
footer {
  background: #222;
  color: #fff;
  text-align: center;
  padding: 0.5rem;
  width: 100%;
  left: 0;
  bottom: 0;
}
footer small {
  display: block;
  text-align: center;
  width: 100%;
}
</style>
