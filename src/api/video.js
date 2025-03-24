import request from './request'
import { serviceUrl } from '../config'

const apiUrl = '/v1/video'

export const videoPage = async (param) => {
  const searchParams = new URLSearchParams(param)
  const { data } = await request.get(`${serviceUrl.gateway + apiUrl}/page?${searchParams}`)
  return data
}

export const videoCount = async (param) => {
  const searchParams = new URLSearchParams(param)
  const { data } = await request.get(`${serviceUrl.gateway + apiUrl}/count?${searchParams}`)
  return data.count
}

export const videoSelectByStatus = async (param) => {
  const searchParams = new URLSearchParams(param)
  const { data } = await request.get(
    `${serviceUrl.gateway + apiUrl}/selectByStatus?${searchParams}`
  )
  return data.list
}

export const videoFind = async (param) => {
  const searchParams = new URLSearchParams(param)
  const { data } = await request.get(`${serviceUrl.gateway + apiUrl}/find?${searchParams}`)
  return data.item
}

export const videoFindByStatus = async (param) => {
  const searchParams = new URLSearchParams(param)
  const { data } = await request.get(`${serviceUrl.gateway + apiUrl}/findByStatus?${searchParams}`)
  return data.item
}

export const videoSave = async (param) => {
  return request.post(`${serviceUrl.gateway + apiUrl}/save`, param)
}

export const videoDel = async (id) => {
  return request.delete(`${serviceUrl.gateway + apiUrl}/del/` + id)
}

export const videoMakeByF2F = async (id) => {
  return request.post(`${serviceUrl.gateway + apiUrl}/makeByF2F/` + id)
}
