import request from './request'
import { serviceUrl } from '../config'

export const modelPage = async (param) => {
  const searchParams = new URLSearchParams(param)
  return request.get(`${serviceUrl.gateway}/v1/model/page?${searchParams}`)
}

export const modelCount = async (param) => {
  const searchParams = new URLSearchParams(param)
  return request.get(`${serviceUrl.gateway}/v1/model/count?${searchParams}`)
}

export const modelAdd = async (param) => {
  // 处理FormData对象或其他参数
  let requestData = param;
  let config = {};

  // 如果参数不是FormData，需要构建FormData
  if (!(param instanceof FormData)) {
    // 创建新的FormData
    const formData = new FormData();

    // 将普通对象的属性添加到FormData中
    Object.keys(param).forEach(key => {
      // 处理文件对象
      if (param[key] instanceof File) {
        formData.append('file', param[key]);
      } else {
        formData.append(key, param[key]);
      }
    });

    requestData = formData;
  }

  // 为FormData请求设置正确的头部
  if (requestData instanceof FormData) {
    config.headers = {
      'Content-Type': 'multipart/form-data'
    };
  }

  return request.post(`${serviceUrl.gateway}/v1/model/add`, requestData, config);
}

export const modelFind = async (param) => {
  const searchParams = new URLSearchParams(param)
  return request.get(`${serviceUrl.gateway}/v1/model/find?${searchParams}`)
}

export const modelDel = async (param) => {
  const searchParams = new URLSearchParams(param)
  return request.delete(`${serviceUrl.gateway}/v1/model/del?${searchParams}`)
}
