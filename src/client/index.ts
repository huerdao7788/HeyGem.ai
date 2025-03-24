import webClient, { FileFilter, FileAPI, AppAPI, WebClientAPI } from './web-client';

// 导出客户端API，应用中通过这个对象访问功能
export default webClient;

// 扩展文件API接口
export interface ExtendedFileAPI extends FileAPI {
  selectImage: () => Promise<File | null>;
  selectVideo: () => Promise<File | null>;
  selectAudio: () => Promise<File | null>;
}

// 定义扩展客户端API接口
export interface ClientAPI {
  file: ExtendedFileAPI;
  app: AppAPI;
}

// 导出扩展的客户端API
export const Client: ClientAPI = {
  file: {
    ...webClient.file,
    selectFile: (filter: FileFilter = {}) => {
      return webClient.file.selectFile(filter);
    },
    selectImage: async () => {
      return Client.file.selectFile({ name: 'Images', extensions: ['jpg', 'png', 'jpeg'] });
    },
    selectVideo: async () => {
      return Client.file.selectFile({ name: 'Videos', extensions: ['mp4', 'mov'] });
    },
    selectAudio: async () => {
      return Client.file.selectFile({ name: 'Audios', extensions: ['mp3', 'wav', 'flac', 'm4a'] });
    }
  },
  app: {
    ...webClient.app
  }
};

// 导出类型定义
export type { FileFilter, FileAPI, AppAPI, WebClientAPI };
