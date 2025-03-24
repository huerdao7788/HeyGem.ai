import { serviceUrl } from '../config'
import { saveAudio } from './voice.js'
import { videoCount, videoDel, videoFind, videoPage, videoSave } from '../api/video'
import request from '../api/request'

/**
 * 分页查询合成结果
 * @param {number} page
 * @param {number} pageSize
 * @param name
 * @returns
 */
export async function page({ page, pageSize, name = '' }) {
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

export async function findVideo(videoId) {
  const video = await videoFind({ id: videoId })
  return {
    ...video,
    filePath: serviceUrl.gateway + video.filePath
  }
}

export async function countVideo(name = '') {
  return await videoCount({ name: name })
}

export async function saveVideo({ id, modelId, name, textContent, voiceId, audioPath }) {
  if (audioPath) {
    // 处理不同类型的audioPath
    if (audioPath instanceof File) {
      // 如果是File对象，直接上传
      let res = await saveAudio(audioPath);
      voiceId = res.id;
      audioPath = res.audioPath;
    } else if (typeof audioPath === 'string') {
      // 如果是URL（blob或data URL）
      if (audioPath.startsWith('blob:') || audioPath.startsWith('data:')) {
        let res = await saveAudio(audioPath);
        voiceId = res.id;
        audioPath = res.audioPath;
      } else {
        // 常规路径
        let res = await saveAudio(audioPath);
        voiceId = res.id;
        audioPath = res.audioPath;
      }
    } else if (audioPath.fileObj) {
      // 兼容处理含有fileObj属性的对象
      let res = await saveAudio(audioPath.fileObj);
      voiceId = res.id;
      audioPath = res.audioPath;
    }
  }

  // 发送视频保存请求
  const { data } = await videoSave({ id, modelId, name, textContent, voiceId, audioPath });
  return data.id;
}

/**
 * 合成视频
 * 更新视频状态为waiting
 * @param {number} videoId
 * @returns
 */
export async function makeVideo(videoId) {
  await videoSave({ id: videoId, status: 'waiting' })
  return videoId
}

export async function removeVideo(videoId) {
  // 删除视频
  return await videoDel(videoId)
}

