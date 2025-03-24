import request from './request';
import { ApiResponse, PageParams, Video, VideoApi } from './types';

const apiUrl = '/v1/video';

/**
 * 视频分页查询
 * @param param 分页参数
 * @returns 分页结果
 */
export const videoPage = async (param: PageParams): Promise<VideoApi.PageResponse> => {
  const searchParams = new URLSearchParams(param as any);
  const { data } = await request.get(`${apiUrl}/page?${searchParams}`);
  return data;
};

/**
 * 统计视频数量
 * @param param 查询参数
 * @returns 数量
 */
export const videoCount = async (param: VideoApi.CountRequest): Promise<number> => {
  const searchParams = new URLSearchParams(param as any);
  const { data } = await request.get(`${apiUrl}/count?${searchParams}`);
  return data.count;
};

/**
 * 根据状态查询视频列表
 * @param param 查询参数
 * @returns 视频列表
 */
export const videoSelectByStatus = async (param: VideoApi.SelectByStatusRequest): Promise<Video[]> => {
  const searchParams = new URLSearchParams(param as any);
  const { data } = await request.get(
    `${apiUrl}/selectByStatus?${searchParams}`
  );
  return data.list;
};

/**
 * 查询单个视频
 * @param param 查询参数
 * @returns 视频信息
 */
export const videoFind = async (param: VideoApi.FindRequest): Promise<Video> => {
  const searchParams = new URLSearchParams(param as any);
  const { data } = await request.get(`${apiUrl}/find?${searchParams}`);
  return data.item;
};

/**
 * 根据状态查询单个视频
 * @param param 查询参数
 * @returns 视频信息
 */
export const videoFindByStatus = async (param: VideoApi.FindByStatusRequest): Promise<Video> => {
  const searchParams = new URLSearchParams(param as any);
  const { data } = await request.get(`${apiUrl}/findByStatus?${searchParams}`);
  return data.item;
};

/**
 * 保存视频
 * @param param 保存参数
 * @returns 保存结果
 */
export const videoSave = async (param: VideoApi.SaveRequest): Promise<{ id: number }> => {
  const { data } = await request.post(`${apiUrl}/save`, param);
  return data;
};

/**
 * 删除视频
 * @param id 视频ID
 * @returns 删除结果
 */
export const videoDel = async (id: number): Promise<ApiResponse<any>> => {
  const { data } = await request.delete(`${apiUrl}/del/${id}`);
  return data;
};

/**
 * 合成视频
 * @param id 视频ID
 * @returns 合成结果
 */
export const videoMakeByF2F = async (id: number): Promise<ApiResponse<any>> => {
  const { data } = await request.post(`${apiUrl}/make?id=${id}`);
  return data;
};
