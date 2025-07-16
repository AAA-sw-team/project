<template>
  <div id="app">
    <header>
      <h1>PQ智能系统</h1>
    </header>
    <main>
      <router-view />
    </main>
    <footer>
      <small>© 2024 PQ PopQuiz Web</small>
    </footer>
  </div>
</template>

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
  padding: 1rem;
  text-align: center;
}
main {
  flex: 1;
  padding: 2rem;
}
footer {
  background: #222;
  color: #fff;
  text-align: center;
  padding: 0.5rem;
}
</style>
