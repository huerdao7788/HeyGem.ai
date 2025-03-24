import request from './request'
import { serviceUrl } from '../config/config'

const apiUrl = '/v1/voice'

export const voiceSave = async (param) => {
  // 处理不同类型的参数
  let requestData = param;

  // 如果参数是File对象，转换为FormData
  if (param instanceof File) {
    const formData = new FormData();
    formData.append('file', param);
    requestData = formData;
  }

  // 添加Content-Type头部配置用于FormData请求
  const config = {};
  if (requestData instanceof FormData) {
    config.headers = {
      'Content-Type': 'multipart/form-data'
    };
  }

  const res = await request.post(`${serviceUrl.gateway + apiUrl}/save`, requestData, config);
  return res.data;
}

export const voicePage = async (param) => {
  const searchParams = new URLSearchParams(param)
  const { data } = await request.get(`${serviceUrl.gateway + apiUrl}/page?${searchParams}`)
  console.log('data',data)
  return data
}
