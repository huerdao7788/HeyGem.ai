/**
 * URL处理工具函数
 */
import { serviceUrl, appConfig } from '../config';

/**
 * 生成资源的完整URL
 * @param path 资源路径
 * @returns 完整的资源URL
 */
export function getAssetUrl(path: string): string {
  if (!path) return '';

  // 如果已经是完整URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }

  // 确保path以/开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // 开发环境使用代理
  if (appConfig.isDevelopment) {
    return `${serviceUrl.baseUrl}${normalizedPath}`;
  }
  // 生产环境拼接完整URL
  else {
    return `${serviceUrl.assetPrefix}${normalizedPath}`;
  }
}
