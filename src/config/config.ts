// 服务URL配置接口
export interface ServiceUrlConfig {
  baseUrl: string;
  assetPrefix: string; // 资源前缀，用于拼接资源URL
  [key: string]: string; // 允许添加其他服务端点
}

// 开发环境使用代理，生产环境使用完整URL
export const serviceUrl: ServiceUrlConfig = {
  // 通过Vite代理转发的API请求路径
  baseUrl: import.meta.env.VITE_API_BASE_URL || '',
  // 资源前缀，用于拼接资源URL
  assetPrefix: import.meta.env.VITE_API_TARGET || ''
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
