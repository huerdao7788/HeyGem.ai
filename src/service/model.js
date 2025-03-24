import { serviceUrl } from '../config'
import { modelAdd, modelCount, modelDel, modelFind, modelPage } from '../api/model'

/**
 * 新增模特
 * @param {string} modelName 模特名称
 * @param {string|File} videoPath 模特视频路径或文件对象
 * @returns
 */
export async function addModel(modelName, videoPath) {
  // 创建FormData对象
  const formData = new FormData()
  formData.append('name', modelName)

  // 处理File对象
  if (videoPath instanceof File) {
    formData.append('file', videoPath)
    const res = await modelAdd(formData)
    return res.data.id
  }
  // 处理Blob URL
  else if (typeof videoPath === 'string' && videoPath.startsWith('blob:')) {
    try {
      const response = await fetch(videoPath)
      const blob = await response.blob()
      const file = new File([blob], 'video.mp4', { type: 'video/mp4' })
      formData.append('file', file)
      const res = await modelAdd(formData)
      return res.data.id
    } catch (error) {
      console.error('处理Blob URL失败:', error)
      throw error
    }
  }
  // 处理字符串路径（兼容旧代码）
  else if (typeof videoPath === 'string') {
    // 创建文件选择器
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'video/*'
    fileInput.style.display = 'none'
    document.body.appendChild(fileInput)

    return new Promise((resolve, reject) => {
      fileInput.onchange = async () => {
        if (fileInput.files && fileInput.files[0]) {
          formData.append('file', fileInput.files[0])
          try {
            const res = await modelAdd(formData)
            resolve(res.data.id)
          } catch (error) {
            reject(error)
          } finally {
            document.body.removeChild(fileInput)
          }
        } else {
          reject(new Error('未选择文件'))
          document.body.removeChild(fileInput)
        }
      }
      fileInput.click()
    })
  }
  // 其他情况（出错处理）
  else {
    throw new Error('无效的视频文件或路径')
  }
}

export async function page({ page, pageSize, name }) {
  const res = await modelPage({ page: page, pageSize: pageSize, name: name })
  const list = res.data.list?.map((model) => {
    return {
      ...model,
      videoPath: serviceUrl.gateway + model.videoPath,
      audioPath: serviceUrl.gateway + model.audioPath
    }
  })
  return {
    total: res.data.total,
    list: list
  }
}

export async function findModel(modelId) {
  const { data } = await modelFind({ id: modelId })
  return {
    ...data.item,
    videoPath: serviceUrl.gateway + data.item.videoPath,
    audioPath: serviceUrl.gateway + data.item.audioPath
  }
}

export async function removeModel(modelId) {
  await modelDel({ id: modelId })
}

export async function countModel(name = '') {
  const res = await modelCount({ name: name })
  return res.data.count
}
