<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
onMounted(() => {
  router.replace('/speaker/home')
})
</script>

<style scoped>
.speaker-layout {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 220px;
  background: #fff;
  border-right: 1.5px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 3.5rem;
  box-shadow: 2px 0 16px 0 rgba(60,120,200,0.06);
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
}
.welcome-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2.5rem;
}
.welcome {
  font-size: 1.18rem;
  color: #3eaf7c;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}
ul {
  list-style: none;
  padding: 0;
  width: 100%;
}
li {
  padding: 1.1rem 2.5rem;
  cursor: pointer;
  color: #333;
  font-size: 1.13rem;
  display: flex;
  align-items: center;
  transition: background 0.2s, color 0.2s;
  border-radius: 0 20px 20px 0;
  margin-bottom: 0.5rem;
}
li .icon {
  margin-right: 0.7rem;
  font-size: 1.2rem;
}
li.active, li:hover {
  background: linear-gradient(90deg, #3eaf7c 60%, #b2dfc7 100%);
  color: #fff;
}
.main-content {
  flex: 1;
  margin-left: 220px;
  padding: 0;
  min-height: auto; /* 🔁 让内容自适应高度 */
  display: flex;
  justify-content: center;
  align-items: flex-start; /* ⬆️ 让内容贴上 */
  padding-top: 1.5rem; /* ⬆️ 添加顶部间距 */
}

.main-card {
  width: 100%;
  max-width: 900px; /* ⬅️ 限制最大宽度 */
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 6px 32px 0 rgba(60,120,200,0.13);
  padding: 2rem 2rem;
  margin: 0.5rem auto 2rem auto; /* 上移并居中 */
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
}


@media (max-width: 900px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
    padding-top: 1.2rem;
  }

  .sidebar {
    position: static;
    width: 100%;
    flex-direction: row;
    justify-content: flex-start;
    box-shadow: none;
    border-right: none;
    border-bottom: 1.5px solid #e0e0e0;
    padding: 1rem 0;
  }

  .main-card {
    width: 100%;
    padding: 1.2rem 1rem;
    margin: 0.5rem 0;
  }
}

</style> 