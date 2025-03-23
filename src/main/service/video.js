import { ipcMain } from 'electron'
import fs from 'fs'
import { serviceUrl } from '../config/config.js'
import { saveAudio } from './voice.js'
import { videoCount, videoDel, videoFind, videoPage, videoSave } from '../api/video'
import request from '../api/request'

const MODEL_NAME = 'video'

/**
 * 分页查询合成结果
 * @param {number} page
 * @param {number} pageSize
 * @param name
 * @returns
 */
async function page({ page, pageSize, name = '' }) {
  // 查询的有waiting状态的视频
  let { total, list } = await videoPage({ page: page, pageSize: pageSize, name: name })
  if (list) {
    list = list.map((video) => {
      video = {
        ...video,
        filePath: serviceUrl.gateway + video.filePath
      }
      return video
    })
  }
  return {
    total,
    list
  }
}

async function findVideo(videoId) {
  const video = await videoFind({ id: videoId })
  return {
    ...video,
    filePath: serviceUrl.gateway + video.filePath
  }
}

async function countVideo(name = '') {
  return await videoCount({ name: name })
}

async function saveVideo({ id, modelId, name, textContent, voiceId, audioPath }) {
  if (audioPath) {
    // 上传音频到服务器
    let res = await saveAudio(audioPath)
    voiceId = res.id
    audioPath = res.audioPath
  }
  const { data } = await videoSave({ id, modelId, name, textContent, voiceId, audioPath })
  return data.id
}

/**
 * 合成视频
 * 更新视频状态为waiting
 * @param {number} videoId
 * @returns
 */
async function makeVideo(videoId) {
  await videoSave({ id: videoId, status: 'waiting' })
  return videoId
}

async function removeVideo(videoId) {
  // 删除视频
  return await videoDel(videoId)
}

async function exportVideo(videoId, outputPath) {
  const video = await videoFind({ id: videoId })
  const res = await request.post(serviceUrl.gateway + video.filePath, {
    responseType: 'arraybuffer'
  })
  fs.writeFileSync(outputPath, res, 'binary')
}

async function modify(video) {
  const { data } = await saveVideo(video)
  return data
}

export function init() {
  ipcMain.handle(MODEL_NAME + '/page', (event, ...args) => {
    return page(...args)
  })
  ipcMain.handle(MODEL_NAME + '/make', (event, ...args) => {
    return makeVideo(...args)
  })
  ipcMain.handle(MODEL_NAME + '/modify', (event, ...args) => {
    return modify(...args)
  })
  ipcMain.handle(MODEL_NAME + '/save', (event, ...args) => {
    return saveVideo(...args)
  })
  ipcMain.handle(MODEL_NAME + '/find', (event, ...args) => {
    return findVideo(...args)
  })
  ipcMain.handle(MODEL_NAME + '/count', (event, ...args) => {
    return countVideo(...args)
  })
  ipcMain.handle(MODEL_NAME + '/export', (event, ...args) => {
    return exportVideo(...args)
  })
  ipcMain.handle(MODEL_NAME + '/remove', (event, ...args) => {
    return removeVideo(...args)
  })
}
