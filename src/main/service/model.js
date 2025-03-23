import { ipcMain } from 'electron'
import fs from 'fs'
import { serviceUrl } from '../config/config.js'
import { modelAdd, modelCount, modelDel, modelFind, modelPage } from '../api/model'
import FormData from 'form-data'

const MODEL_NAME = 'model'

/**
 * 新增模特
 * @param {string} modelName 模特名称
 * @param {string} videoPath 模特视频路径
 * @returns
 */
async function addModel(modelName, videoPath) {
  const formData = new FormData()
  formData.append('name', modelName)
  formData.append('file', fs.createReadStream(videoPath))
  const res = await modelAdd(formData)
  return res.data.id
}

async function page({ page, pageSize, name }) {
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

async function findModel(modelId) {
  const { data } = await modelFind({ id: modelId })
  return {
    ...data.item,
    videoPath: serviceUrl.gateway + data.item.videoPath,
    audioPath: serviceUrl.gateway + data.item.audioPath
  }
}

async function removeModel(modelId) {
  await modelDel({ id: modelId })
}

async function countModel(name = '') {
  const res = await modelCount({ name: name })
  return res.data.count
}

export function init() {
  ipcMain.handle(MODEL_NAME + '/addModel', (event, ...args) => {
    return addModel(...args)
  })
  ipcMain.handle(MODEL_NAME + '/page', (event, ...args) => {
    return page(...args)
  })
  ipcMain.handle(MODEL_NAME + '/find', (event, ...args) => {
    return findModel(...args)
  })
  ipcMain.handle(MODEL_NAME + '/count', (event, ...args) => {
    return countModel(...args)
  })
  ipcMain.handle(MODEL_NAME + '/remove', (event, ...args) => {
    return removeModel(...args)
  })
}
