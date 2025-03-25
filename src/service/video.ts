import { serviceUrl } from '../config';
import { saveAudio } from './voice';
import { videoCount, videoDel, videoFind, videoPage, videoSave } from '../api/video';
import { getAssetUrl } from '../utils/url';

// 视频项类型定义
interface VideoItem {
  id: string | number;
  name: string;
  filePath: string;
  status?: string;
  modelId?: string | number;
  textContent?: string;
  voiceId?: string | number;
  audioPath?: string;
  duration?: number | string;
  message?: string;
  progress?: number | string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  param?: string;
  code?: string;
  [key: string]: any;
}

// 分页参数类型
interface VideoPageParams {
  page: number | string;
  pageSize: number | string;
  name?: string;
}

// 分页结果类型
interface VideoPageResult {
  total: number;
  list: VideoItem[];
}

// 保存视频参数类型
interface SaveVideoParams {
  id?: string | number;
  modelId?: string | number;
  name?: string;
  textContent?: string;
  voiceId?: string | number;
  audioPath?: string;
  audioName?: string;
  status?: string;
}

/**
 * 分页查询合成结果
 * @param params 分页参数
 * @returns 分页结果
 */
export async function page(params: VideoPageParams): Promise<VideoPageResult> {
  // 查询的有waiting状态的视频
  const pageParams: any = {
    page: typeof params.page === 'string' ? parseInt(params.page, 10) : params.page,
    pageSize: typeof params.pageSize === 'string' ? parseInt(params.pageSize, 10) : params.pageSize,
    name: params.name || ''
  };

  let { total, list } = await videoPage(pageParams);

  return {
    total,
    list: list || []
  };
}

/**
 * 查询单个视频
 * @param videoId 视频ID
 * @returns 视频详情
 */
export async function findVideo(videoId: string | number): Promise<VideoItem> {
  // 确保ID是数字类型
  const id = typeof videoId === 'string' ? parseInt(videoId, 10) : videoId;
  const video = await videoFind({ id });
  return {
    ...video,
    filePath: getAssetUrl(video.filePath)
  };
}

/**
 * 统计视频数量
 * @param name 视频名称
 * @returns 视频数量
 */
export async function countVideo(name: string = ''): Promise<number> {
  return await videoCount({ name: name });
}

/**
 * 保存视频
 * @param params 视频参数
 * @returns 视频ID
 */
export async function saveVideo(params: SaveVideoParams): Promise<string | number> {
  const { id, modelId, name, textContent, voiceId, audioPath, audioName, status } = params;
  let finalVoiceId = voiceId;
  let finalAudioPath = audioPath;

  if (audioPath) {
    let res = await saveAudio(audioPath, audioName,"false","");
    finalAudioPath = res.audioPath;
  }

  // 转换为API期望的类型
  const saveParams: any = {
    id: id != null ? (typeof id === 'string' ? parseInt(id, 10) : id) : undefined,
    modelId: modelId != null ? (typeof modelId === 'string' ? parseInt(modelId as string, 10) : modelId) : undefined,
    name,
    textContent,
    voiceId: finalVoiceId != null ? (typeof finalVoiceId === 'string' ? parseInt(finalVoiceId as string, 10) : finalVoiceId) : undefined,
    audioPath: finalAudioPath as string,
    status
  };

  // 发送视频保存请求
  const data = await videoSave(saveParams);
  return data.id;
}

/**
 * 合成视频
 * 更新视频状态为waiting
 * @param videoId 视频ID
 * @returns 视频ID
 */
export async function makeVideo(videoId: string | number): Promise<string | number> {
  // 确保ID是数字类型
  const id = typeof videoId === 'string' ? parseInt(videoId, 10) : videoId;
  await videoSave({ id, status: 'waiting' } as any);
  return videoId;
}

/**
 * 删除视频
 * @param videoId 视频ID
 * @returns 操作结果
 */
export async function removeVideo(videoId: string | number): Promise<any> {
  // 确保ID是数字类型
  const id = typeof videoId === 'string' ? parseInt(videoId, 10) : videoId;
  // 删除视频
  return await videoDel(id);
}
