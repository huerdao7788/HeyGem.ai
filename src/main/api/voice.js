import request from './request'
import { serviceUrl } from '../config/config'

const apiUrl = '/v1/voice'

export const voiceSave = async (param) => {
  const res = await request.postForm(`${serviceUrl.gateway + apiUrl}/save`, param, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...param.getHeaders()
    },
    data: param
  })
  return res.data
}

export const voicePage = async (param) => {
  const searchParams = new URLSearchParams(param)
  const { data } = await request.get(`${serviceUrl.gateway + apiUrl}/page?${searchParams}`)
  console.log('data',data)
  return data
}
