import request from './request'
import { serviceUrl } from '../config/config'

export const modelPage = async (param) => {
  const searchParams = new URLSearchParams(param)
  return request.get(`${serviceUrl.gateway}/v1/model/page?${searchParams}`)
}

export const modelCount = async (param) => {
  const searchParams = new URLSearchParams(param)
  return request.get(`${serviceUrl.gateway}/v1/model/count?${searchParams}`)
}

export const modelAdd = async (param) => {
  return request.postForm(`${serviceUrl.gateway}/v1/model/add`, param, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...param.getHeaders()
    },
    data: param
  })
}

export const modelFind = async (param) => {
  const searchParams = new URLSearchParams(param)
  return request.get(`${serviceUrl.gateway}/v1/model/find?${searchParams}`)
}

export const modelDel = async (param) => {
  const searchParams = new URLSearchParams(param)
  return request.delete(`${serviceUrl.gateway}/v1/model/del?${searchParams}`)
}
