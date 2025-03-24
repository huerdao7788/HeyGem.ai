import { localUrl } from '@renderer/utils'
import * as videoService from '../service/video'
import * as modelService from '../service/model'
import * as voiceService from '../service/voice'

export function videoPage({ page = 1, pageSize = 1, name = '' }) {
  return videoService.page({ page, pageSize, name })
}

export function findVideo(id) {
  return videoService.findVideo(id)
}

export function removeVideo(id) {
  return videoService.removeVideo(id)
}

export function saveVideo(video) {
  // id, modelId, name, text_content, voiceId, audioPath
  return videoService.saveVideo(video)
}

export function makeVideo(id) {
  return videoService.makeVideo(id)
}
export function countVideo(name = '') {
  return videoService.countVideo(name)
}

export function modelPage({ page = 1, pageSize = 1, name = '' }) {
  return modelService.page({ page, pageSize, name })
}

export function findModel(id) {
  return modelService.findModel(id)
}

export function addModel({ name, videoPath }) {
  // 检查videoPath是否为File对象
  if (videoPath instanceof File) {
    // 直接传递File对象
    return modelService.addModel(name, videoPath);
  } else if (videoPath && typeof videoPath === 'string') {
    // 如果是字符串路径，可能是Blob URL
    if (videoPath.startsWith('blob:')) {
      // 处理Blob URL
      return fetch(videoPath)
        .then(response => response.blob())
        .then(blob => {
          // 创建File对象并传递
          const file = new File([blob], 'video.mp4', { type: 'video/mp4' });
          return modelService.addModel(name, file);
        });
    } else {
      // 常规文件路径，去除file://前缀
      videoPath = localUrl.delFileProtocol(videoPath);
      return modelService.addModel(name, videoPath);
    }
  }
  // 传入空值，交由服务处理错误情况
  return modelService.addModel(name, videoPath);
}

export function countModel(name = '') {
  return modelService.countModel(name)
}

export function removeModel(id) {
  return modelService.removeModel(id)
}

export function audition(id, text) {
  return voiceService.audition(id, text)
}

export function voicePage({ page = 1, pageSize = 1, name = '' }) {
  return voiceService.page({ page, pageSize, name })
}

export function voiceSave(path) {
  return voiceService.saveAudio(path)
}


// 为了处理debug功能
export const devTools = {
  send(channel) {
    if (channel === 'open-devtools') {
      console.log('[Web] 请使用浏览器开发者工具 (F12)');
    }
  }
}
