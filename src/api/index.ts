import { localUrl } from '@renderer/utils'
import * as videoService from '../service/video'
import * as modelService from '../service/model'
import * as voiceService from '../service/voice'

// 定义服务层期望的参数类型
interface PageParam {
  page: number
  pageSize: number
  name: string
}

// 定义服务层语音模块期望的参数类型
interface VoicePageParam {
  page: number | string
  pageSize: number | string
  name: string
}

/**
 * 视频分页查询
 * @param param 分页参数
 * @returns 分页结果
 */
export function videoPage(
  param: { page: number; pageSize: number; name: string } = {
    page: 1,
    pageSize: 1,
    name: ''
  }
) {
  // 使用类型断言处理可能的类型不匹配问题
  return videoService.page(param)
}

/**
 * 查询单个视频
 * @param id 视频ID
 * @returns 视频信息
 */
export function findVideo(id: number | string) {
  return videoService.findVideo(id)
}

/**
 * 删除视频
 * @param id 视频ID
 * @returns 删除结果
 */
export function removeVideo(id: number | string) {
  return videoService.removeVideo(id)
}

/**
 * 保存视频
 * @param video 视频信息
 * @returns 保存结果
 */
export function saveVideo(video: any) {
  // id, modelId, name, text_content, voiceId, audioPath
  return videoService.saveVideo(video)
}

/**
 * 合成视频
 * @param id 视频ID
 * @returns 合成结果
 */
export function makeVideo(id: number | string) {
  return videoService.makeVideo(id)
}

/**
 * 统计视频数量
 * @param name 视频名称
 * @returns 数量
 */
export function countVideo(name = '') {
  return videoService.countVideo(name)
}

/**
 * 模特分页查询
 * @param param 分页参数
 * @returns 分页结果
 */
export function modelPage(
  param: { page: number; pageSize: number; name: string } = {
    page: 1,
    pageSize: 1,
    name: ''
  }
) {
  // 使用类型断言处理可能的类型不匹配问题
  return modelService.page(param)
}

/**
 * 查询单个模特
 * @param id 模特ID
 * @returns 模特信息
 */
export function findModel(id: number | string) {
  return modelService.findModel(id)
}

/**
 * 添加模特
 * @param params 模特信息
 * @returns 添加结果
 */
export function addModel(params: { name: string; videoPath: File | string }) {
  // 检查videoPath是否为File对象
  if (params.videoPath instanceof File) {
    // 直接传递File对象
    return modelService.addModel(params.name, params.videoPath)
  } else if (params.videoPath && typeof params.videoPath === 'string') {
    // 如果是字符串路径，可能是Blob URL
    if (params.videoPath.startsWith('blob:')) {
      // 处理Blob URL
      return fetch(params.videoPath)
        .then((response) => response.blob())
        .then((blob) => {
          // 创建File对象并传递
          const file = new File([blob], 'video.mp4', { type: 'video/mp4' })
          return modelService.addModel(params.name, file)
        })
    } else {
      // 常规文件路径，去除file://前缀
      const cleanPath = localUrl.delFileProtocol(params.videoPath)
      return modelService.addModel(params.name, cleanPath)
    }
  }
  // 传入空值，交由服务处理错误情况
  return modelService.addModel(params.name, params.videoPath)
}

/**
 * 统计模特数量
 * @param name 模特名称
 * @returns 数量
 */
export function countModel(name = '') {
  return modelService.countModel(name)
}

/**
 * 删除模特
 * @param id 模特ID
 * @returns 删除结果
 */
export function removeModel(id: number | string) {
  return modelService.removeModel(id)
}

/**
 * 试听语音
 * @param id 语音ID
 * @param text 文本内容
 * @returns 试听结果
 */
export function audition(id: number | string, text: string) {
  // 确保ID是字符串类型
  const voiceId = id.toString()
  return voiceService.audition(voiceId, text)
}

/**
 * 语音分页查询
 * @param param 分页参数
 * @returns 分页结果
 */
export function voicePage(
  param: { page: number; pageSize: number; name: string } = {
    page: 1,
    pageSize: 1,
    name: ''
  }
) {
  // 使用类型断言处理可能的类型不匹配问题
  return voiceService.page(param)
}

/**
 * 保存语音
 * @param path 语音路径或文件
 * @param audioName
 * @param save
 * @returns 保存结果
 */
export function voiceSave(path: string, audioName: string, save: string, audioText: string) {
  return voiceService.saveAudio(path, audioName, save, audioText)
}

// 为了处理debug功能
export const devTools = {
  send(channel: string) {
    if (channel === 'open-devtools') {
      console.log('[Web] 请使用浏览器开发者工具 (F12)')
    }
  }
}
