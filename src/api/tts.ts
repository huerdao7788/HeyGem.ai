import request from './request';
import { TtsApi } from './types';
import { getApiUrl } from '../utils/url';

/**
 * 文本转语音
 * @param param 请求参数
 * @returns 二进制音频数据
 */
export function makeAudio(param: TtsApi.InvokeRequest): Promise<ArrayBuffer> {
  // 响应拦截器已配置为针对arraybuffer类型直接返回data，不包装在ApiResponse中
  return request.post(getApiUrl(`/v1/tts/invoke`), param, {
    responseType: 'arraybuffer'
  }) as unknown as Promise<ArrayBuffer>;
}
