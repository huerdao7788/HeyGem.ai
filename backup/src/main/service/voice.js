import { makeAudio as makeAudioApi } from '../api/tts.js'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { serviceUrl } from '../config/config.js'
import { ipcMain } from 'electron'
import { voicePage, voiceSave } from '../api/voice'
import FormData from 'form-data'

const MODEL_NAME = 'voice'

export async function saveAudio(filePath) {
  console.log(filePath)
  const formData = new FormData()
  formData.append('file', fs.createReadStream(filePath))
  const { id,audioPath } = await voiceSave(formData)
  return { id,audioPath }
}

export async function makeAudio({ voiceId, text, targetDir }) {
  const uuid = crypto.randomUUID()
  const res = await makeAudioApi({ voiceId: voiceId, text: text })
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, {
      recursive: true
    })
  }
  fs.writeFileSync(path.join(targetDir, `${uuid}.wav`), res, 'binary')
  return `${uuid}.wav`
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
  const tmpDir = require('os').tmpdir()
  const audioPath = await makeAudio({ voiceId, text, targetDir: tmpDir })
  return path.join(tmpDir, audioPath)
}

export function init() {
  ipcMain.handle(MODEL_NAME + '/audition', (event, ...args) => {
    return audition(...args)
  })
  ipcMain.handle(MODEL_NAME + '/page', (event, ...args) => {
    return page(...args)
  })
  ipcMain.handle(MODEL_NAME + '/save', (event, ...args) => {
    return saveAudio(...args)
  })
}
