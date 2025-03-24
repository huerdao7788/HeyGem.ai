import { dialog } from 'electron'

export default {
  name: 'file',

  // 选择文件
  async selectFile(app, filters = {}) {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'], // 也可以用 openDirectory 选择文件夹
      filters: [filters, { name: 'All Files', extensions: ['*'] }].filter(
        (item) => Object.keys(item).length
      )
    })

    if (!result.canceled) {
      return result.filePaths[0]
    }
  },
  async saveFile(app, defaultPath = '') {
    const result = await dialog.showSaveDialog({
      defaultPath
    })
    if (!result.canceled) {
      return result.filePath
    }
  }
}
