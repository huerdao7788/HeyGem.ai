import request from './request';
import { ApiResponse, PageParams, VoiceApi } from './types';

const apiUrl = '/v1/voice';

/**
 * 保存语音
 * @param param 保存参数
 * @returns 保存结果
 */
export const voiceSave = async (param: File | FormData): Promise<VoiceApi.SaveResponse> => {
  // 处理不同类型的参数
  let requestData: any = param;

  // 如果参数是File对象，转换为FormData
  if (param instanceof File) {
    const formData = new FormData();
    formData.append('file', param);
    requestData = formData;
  }

  // 添加Content-Type头部配置用于FormData请求
  const config: { headers?: Record<string, string> } = {};
  if (requestData instanceof FormData) {
    config.headers = {
      'Content-Type': 'multipart/form-data'
    };
  }

  const res = await request.post<VoiceApi.SaveResponse>(`${apiUrl}/save`, requestData, config);
  return res.data;
};

/**
 * 语音分页查询
 * @param param 分页参数
 * @returns 分页结果
 */
export const voicePage = async (param: PageParams): Promise<VoiceApi.PageResponse> => {
  const searchParams = new URLSearchParams(param as any);
  const { data } = await request.get<VoiceApi.PageResponse>(`${apiUrl}/page?${searchParams}`);
  return data;
};

/**
 * 删除语音
 * @param id 语音ID
 * @returns 删除结果
 */
export const voiceDelete = async (id: number): Promise<ApiResponse<null>> => {
  const { data } = await request.delete<ApiResponse<null>>(`${apiUrl}/del/${id}`);
  return data;
};

/**
 * 获取语音详情
 * @param id 语音ID
 * @returns 语音详情
 */
export const voiceFind = async (id: number): Promise<VoiceApi.FindResponse> => {
  const { data } = await request.get<VoiceApi.FindResponse>(`${apiUrl}/find/${id}`);
  return data;
};
