import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, RequestConfig } from './types';
import { serviceUrl, appConfig } from '../config';

// 创建axios实例
const instance: AxiosInstance = axios.create({
  baseURL: serviceUrl.baseUrl, // 设置基础URL，避免每次请求都调用getApiUrl
  timeout: 60000, // 增加超时时间，以支持大文件下载
  withCredentials: false, // 跨域请求不发送cookies
  responseType: 'json', // 默认响应类型
  maxContentLength: 100 * 1024 * 1024, // 最大内容长度：100MB
  maxBodyLength: 100 * 1024 * 1024 // 最大请求体长度：100MB
});

// 请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // 在发送请求之前做些什么
    // 如果是下载类型的请求，设置合适的响应类型
    if (config.responseType === 'arraybuffer' || config.responseType === 'blob') {
      // 对于大文件下载请求，确保不会超时
      config.timeout = 0;
    }
    return config;
  },
  (error: any): Promise<never> => {
    // 对请求错误做些什么
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse): any => {
    // 对于二进制数据，直接返回响应体
    if (response.config.responseType === 'arraybuffer' || response.config.responseType === 'blob') {
      return response.data;
    }

    // 2xx 范围内的状态码都会触发该函数
    return response.data;
  },
  (error: any): Promise<never> => {
    // 超出 2xx 范围的状态码都会触发该函数
    console.error('Response error:', error);
    // 增加错误信息
    const errorMsg = error.response?.data?.message || error.message || '请求失败';
    error.message = errorMsg;
    return Promise.reject(error);
  }
);

// 封装请求方法
const request = {
  get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return instance.get(url, config);
  },

  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return instance.post(url, data, config);
  },

  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return instance.put(url, data, config);
  },

  delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return instance.delete(url, config);
  }
};

export default request;
