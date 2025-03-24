// 服务URL配置接口
export interface ServiceUrlConfig {
  gateway: string;
  [key: string]: string; // 允许添加其他服务端点
}

// 开发环境使用代理，生产环境使用完整URL
export const serviceUrl: ServiceUrlConfig = {
  // 开发模式下使用相对路径，通过Vite代理转发
  gateway: import.meta.env.VITE_API_BASE_URL || '/api'
}

// 应用配置
export interface AppConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  version: string;
}

// 导出应用环境配置
export const appConfig: AppConfig = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  version: import.meta.env.VITE_APP_VERSION || '1.0.0'
}
