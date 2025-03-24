import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@renderer': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      // 转发所有/api开头的请求到目标服务器
      '/api': {
        target: 'http://120.236.203.50:38000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          // 代理请求事件
          proxy.on('error', (err, req, res) => {
            console.log('代理错误', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('发送请求到目标服务器', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('收到目标服务器响应', req.url);
          });
        },
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
  }
})
