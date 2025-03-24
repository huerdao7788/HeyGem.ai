import webClient from './web-client';

// 导出客户端API，应用中通过这个对象访问功能
export default webClient;

export const Client = {
  file: {
    ...webClient.file,
    selectFile: (filter = {}) => {
      return webClient.file.selectFile(filter)
    },
    selectImage: async () => {
      return Client.file.selectFile({ name: 'Images', extensions: ['jpg', 'png', 'jpeg'] })
    },
    selectVideo: async () => {
      return Client.file.selectFile({ name: 'Videos', extensions: ['mp4', 'mov'] })
    },
    selectAudio: async () => {
      return Client.file.selectFile({ name: 'Audios', extensions: ['mp3', 'wav', 'flac', 'm4a'] })
    }
  },
  app: {
    ...webClient.app
  }
}
