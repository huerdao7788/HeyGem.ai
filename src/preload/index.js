import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { exposeWebHandles } from '../main/handlers/index'

// Custom APIs for renderer

const client = exposeWebHandles(electronAPI)

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('client', client)
    contextBridge.exposeInMainWorld('env', {
      FACE_API: process.env.FACE_API,
      TTS_API: process.env.TTS_API,
      FILE_API: process.env.FILE_API,

      MODEL_PATH: process.env.MODEL_PATH,
      TTS_PRODUCT_PATH: process.env.TTS_PRODUCT_PATH,
      TTS_ROOT_PATH: process.env.TTS_ROOT_PATH,
      TTS_TRAIN_PATH: process.env.TTS_TRAIN_PATH,
    });

  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.client = client
  window.env = {
    FACE_API: process.env.FACE_API,
    TTS_API: process.env.TTS_API,
    FILE_API: process.env.FILE_API,

    MODEL_PATH: process.env.MODEL_PATH,
    TTS_PRODUCT_PATH: process.env.TTS_PRODUCT_PATH,
    TTS_ROOT_PATH: process.env.TTS_ROOT_PATH,
    TTS_TRAIN_PATH: process.env.TTS_TRAIN_PATH,
  }
}
