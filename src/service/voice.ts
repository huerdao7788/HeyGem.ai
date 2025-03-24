import { makeAudio as makeAudioApi } from '../api/tts';
import { serviceUrl } from '../config';
import { voicePage, voiceSave } from '../api/voice';
import { getAssetUrl } from '../utils/url';

// 定义返回值类型
interface VoiceResult {
  id: string | number;
  audioPath: string;
}

interface VoicePageParams {
  page: number | string;
  pageSize: number | string;
  name?: string;
}

interface VoiceItem {
  id: string | number;
  audioPath: string;
  name?: string;
  audioText?: string;
  createdAt?: string | Date;
  [key: string]: any;
}

interface VoicePageResult {
  total: number;
  list: VoiceItem[];
}

interface MakeAudioParams {
  voiceId: string | number;
  text: string;
}

/**
 * 保存音频文件
 * @param filePath 文件路径或文件对象
 * @returns 保存结果
 */
export async function saveAudio(filePath: string | File | FormData): Promise<VoiceResult> {
  // 创建FormData对象用于文件上传
  const formData = new FormData();

  // 处理File对象
  if (filePath instanceof File) {
    formData.append('file', filePath);
    const { id, audioPath } = await voiceSave(formData);
    return { id, audioPath };
  }
  // 处理字符串路径（兼容性支持）
  else if (typeof filePath === 'string') {
    // 如果是Data URL或Blob URL，尝试转换为Blob
    if (filePath.startsWith('blob:') || filePath.startsWith('data:')) {
      try {
        const response = await fetch(filePath);
        const blob = await response.blob();
        const file = new File([blob], 'audio.wav', { type: blob.type });
        formData.append('file', file);
        const { id, audioPath } = await voiceSave(formData);
        return { id, audioPath };
      } catch (error) {
        console.error('处理Blob URL失败:', error);
        throw error;
      }
    }

    // 如果是普通路径，创建文件选择器（兼容旧代码）
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    return new Promise<VoiceResult>((resolve, reject) => {
      fileInput.onchange = async () => {
        if (fileInput.files && fileInput.files[0]) {
          formData.append('file', fileInput.files[0]);
          try {
            const { id, audioPath } = await voiceSave(formData);
            resolve({ id, audioPath });
          } catch (error) {
            reject(error);
          } finally {
            document.body.removeChild(fileInput);
          }
        } else {
          reject(new Error('No file selected'));
          document.body.removeChild(fileInput);
        }
      };
      fileInput.click();
    });
  }
  // 处理FormData对象（可能已经包含文件）
  else if (filePath instanceof FormData) {
    const { id, audioPath } = await voiceSave(filePath);
    return { id, audioPath };
  }
  // 其他情况，返回错误
  else {
    throw new Error('不支持的文件类型');
  }
}

/**
 * 生成音频
 * @param params 音频参数
 * @returns 音频Blob URL
 */
export async function makeAudio(params: MakeAudioParams): Promise<string> {
  // 确保voiceId是数字类型
  const voiceId = typeof params.voiceId === 'string'
    ? parseInt(params.voiceId, 10)
    : params.voiceId;

  const res = await makeAudioApi({
    voiceId: voiceId,
    text: params.text
  });

  // Web环境中，直接返回音频数据的Blob
  const blob = new Blob([res], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

/**
 * 音频列表分页查询
 * @param params 分页参数
 * @returns 分页结果
 */
export async function page(params: VoicePageParams): Promise<VoicePageResult> {
  // 转换分页参数，确保类型兼容
  const pageParams: any = {
    page: typeof params.page === 'string' ? parseInt(params.page, 10) : params.page,
    pageSize: typeof params.pageSize === 'string' ? parseInt(params.pageSize, 10) : params.pageSize,
    name: params.name
  };

  let { total, list } = await voicePage(pageParams);


  return {
    total,
    list: list || []
  };
}

/**
 * 试听音频
 * @param voiceId 语音ID
 * @param text 文本内容
 * @returns 音频Blob URL或null
 */
export async function audition(voiceId: string | number, text: string): Promise<string | null> {
  try {
    const audioSrc = await makeAudio({ voiceId, text });

    // 在Web环境中，创建Audio元素播放音频
    const audio = new Audio(audioSrc);
    audio.play();

    return audioSrc;
  } catch (error) {
    console.error('试听失败:', error);
    return null;
  }
}
