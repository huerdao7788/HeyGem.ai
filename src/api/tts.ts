import request from './request';
import { TtsApi } from './types';

const apiUrl = '/v1/tts';

/**
 * 文本转语音
 * @param param 请求参数
 * @returns 二进制音频数据
 */
export function makeAudio(param: TtsApi.InvokeRequest): Promise<ArrayBuffer> {
  // 响应拦截器已配置为针对arraybuffer类型直接返回data，不包装在ApiResponse中
  return request.post(`${apiUrl}/invoke`, param, {
    responseType: 'arraybuffer'
  }) as unknown as Promise<ArrayBuffer>;
}

/**
 * 语音内容识别
 * @param file 音频文件
 * @returns 识别结果
 */
export const train = async (file: File): Promise<TtsApi.TrainResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  // 添加Content-Type头部配置用于FormData请求
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };
  // 调用本地识别接口
  const { data } = await request.post(
    `${apiUrl}/train`,
    formData,
    config
  );
  return data;
};
