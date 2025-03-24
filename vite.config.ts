import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import type { ConfigEnv, UserConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  // 加载env文件中的环境变量
  const env = loadEnv(mode, process.cwd())

  // 打印加载的环境变量，便于调试
  console.log('当前环境:', mode)
  console.log('API目标地址:', env.VITE_API_TARGET)

  return {
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
        // 使用环境变量配置代理
        '/api': {
          target: env.VITE_API_TARGET,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        }
      }
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true
    }
  }
})
