import { makeAudio as makeAudioApi } from '../api/tts.js'
import { serviceUrl } from '../config'
import { voicePage, voiceSave } from '../api/voice'

export async function saveAudio(filePath) {
  // 创建FormData对象用于文件上传
  const formData = new FormData()

  // 处理File对象
  if (filePath instanceof File) {
    formData.append('file', filePath)
    const { id, audioPath } = await voiceSave(formData)
    return { id, audioPath }
  }
  // 处理字符串路径（兼容性支持）
  else if (typeof filePath === 'string') {
    // 如果是Data URL或Blob URL，尝试转换为Blob
    if (filePath.startsWith('blob:') || filePath.startsWith('data:')) {
      try {
        const response = await fetch(filePath)
        const blob = await response.blob()
        const file = new File([blob], 'audio.wav', { type: blob.type })
        formData.append('file', file)
        const { id, audioPath } = await voiceSave(formData)
        return { id, audioPath }
      } catch (error) {
        console.error('处理Blob URL失败:', error)
        throw error
      }
    }

    // 如果是普通路径，创建文件选择器（兼容旧代码）
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'audio/*'
    fileInput.style.display = 'none'
    document.body.appendChild(fileInput)

    return new Promise((resolve, reject) => {
      fileInput.onchange = async () => {
        if (fileInput.files && fileInput.files[0]) {
          formData.append('file', fileInput.files[0])
          try {
            const { id, audioPath } = await voiceSave(formData)
            resolve({ id, audioPath })
          } catch (error) {
            reject(error)
          } finally {
            document.body.removeChild(fileInput)
          }
        } else {
          reject(new Error('No file selected'))
          document.body.removeChild(fileInput)
        }
      }
      fileInput.click()
    })
  }
  // 处理FormData对象（可能已经包含文件）
  else if (filePath instanceof FormData) {
    const { id, audioPath } = await voiceSave(filePath)
    return { id, audioPath }
  }
  // 其他情况，返回错误
  else {
    throw new Error('不支持的文件类型')
  }
}

export async function makeAudio({ voiceId, text }) {
  const res = await makeAudioApi({ voiceId: voiceId, text: text })

  // Web环境中，直接返回音频数据的Blob
  const blob = new Blob([res], { type: 'audio/wav' })
  return URL.createObjectURL(blob)
}

/**
 * 音频列表
 * @param {number} page
 * @param {string} pageSize
 * @param {string} name
 * @returns
 */
export async function page({ page, pageSize, name }) {
  let { total, list } = await voicePage({ page: page, pageSize: pageSize, name: name })
  list = list?.map((voice) => {
    return {
      ...voice,
      audioPath: serviceUrl.gateway + voice.audioPath
    }
  })
  return {
    total,
    list
  }
}

/**
 * 试听音频
 * @param {string} voiceId
 * @param {string} text
 * @returns
 */
export async function audition(voiceId, text) {
  try {
    const audioSrc = await makeAudio({ voiceId, text })

    // 在Web环境中，创建Audio元素播放音频
    const audio = new Audio(audioSrc)
    audio.play()

    return audioSrc
  } catch (error) {
    console.error('试听失败:', error)
    return null
  }
}
