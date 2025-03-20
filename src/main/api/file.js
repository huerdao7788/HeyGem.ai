import request from './request.js'
import { serviceUrl } from '../config/config.js'

export const uploadFile = async (param) => {
  return request.post(`${serviceUrl.fileService}/v1/upload`, param,  {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
