import { localUrl } from '@renderer/utils'

export function videoPage({ page = 1, pageSize = 1, name = '' }) {
  return window.electron.ipcRenderer.invoke('video/page', { page, pageSize, name })
}

export function findVideo(id) {
  return window.electron.ipcRenderer.invoke('video/find', id)
}

export function removeVideo(id) {
  return window.electron.ipcRenderer.invoke('video/remove', id)
}

export function saveVideo(video) {
  // id, modelId, name, text_content, voiceId, audioPath
  return window.electron.ipcRenderer.invoke('video/save', video)
}

export function makeVideo(id) {
  return window.electron.ipcRenderer.invoke('video/make', id)
}

export function exportVideo(id, outputPath) {
  return window.electron.ipcRenderer.invoke('video/export', id, outputPath)
}

export function countVideo(name = '') {
  return window.electron.ipcRenderer.invoke('video/count', name)
}

export function modelPage({ page = 1, pageSize = 1, name = '' }) {
  return window.electron.ipcRenderer.invoke('model/page', { page, pageSize, name })
}

export function findModel(id) {
  return window.electron.ipcRenderer.invoke('model/find', id)
}

export function addModel({ name, videoPath }) {
  videoPath = localUrl.delFileProtocol(videoPath)
  return window.electron.ipcRenderer.invoke('model/addModel', name, videoPath)
}

export function countModel(name = '') {
  return window.electron.ipcRenderer.invoke('model/count', name)
}

export function removeModel(id) {
  return window.electron.ipcRenderer.invoke('model/remove', id)
}
export function audition(id, text) {
  return window.electron.ipcRenderer.invoke('voice/audition', id, text)
}

export function voicePage({ page = 1, pageSize = 1, name = '' }) {
  return window.electron.ipcRenderer.invoke('voice/page', { page, pageSize, name })
}

export function voiceSave(path) {
  return window.electron.ipcRenderer.invoke('voice/save', path)
}
