import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 代理所有 /api 请求到后端
      '/api': {
        target: 'http://localhost:3001', // 你的后端服务地址
        changeOrigin: true,
        // 如果后端没有 /api 前缀，需要重写路径
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
