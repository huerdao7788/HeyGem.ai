
// 开发环境使用代理，生产环境使用完整URL
export const serviceUrl = {
  // 开发模式下使用相对路径，通过Vite代理转发
  gateway: import.meta.env.VITE_API_BASE_URL || '/api'
}
