import request from './request.js'
import { serviceUrl } from '../config'

export function makeAudio(param) {
  return request.post(`${serviceUrl.gateway}/v1/tts/invoke`, param, {
    responseType: 'arraybuffer'
  })
}
