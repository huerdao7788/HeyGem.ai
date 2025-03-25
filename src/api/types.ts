/**
 * API类型定义文件
 */

// 通用响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// 分页请求参数
export interface PageParams {
  page?: number;
  pageSize?: number;
  name?: string;
}

// 分页响应结果
export interface PageResult<T> {
  total: number;
  list: T[];
}

// ==================== 模型实体类型 ====================

// 模特实体
export interface Model {
  id: number;
  name: string;
  videoPath: string;
  audioPath: string;
  voiceId: number;
  createdAt: string;
}

// 视频实体
export interface Video {
  id: number;
  filePath: string;
  status: string;
  message: string;
  modelId: number;
  audioPath: string;
  param: string;
  code: string;
  createdAt: string;
  progress: string | number;
  name: string;
  duration: number | string;
  textContent: string;
  voiceId: number;
}

// 语音实体
export interface Voice {
  id: number;
  name: string;
  audioPath: string;
  audioText: string;
  createdAt: string;
}

// ==================== 接口请求/响应类型 ====================

// 模特管理 API
export namespace ModelApi {
  // 添加模特
  export interface AddRequest {
    name: string;
    file: File;
  }

  export interface AddResponse {
    id: number;
    path: string;
  }

  // 查询模特
  export interface FindRequest {
    id: number;
  }

  export interface FindResponse {
    item: Model;
  }

  // 删除模特
  export interface DeleteRequest {
    id: number;
  }

  // 获取列表
  export interface PageResponse {
    total: number;
    list: Model[];
  }

  // 统计
  export interface CountRequest {
    name?: string;
  }

  export interface CountResponse {
    count: number;
  }
}

// 视频管理 API
export namespace VideoApi {
  // 保存视频
  export interface SaveRequest {
    id?: number;
    filePath?: string;
    status?: string;
    message?: string;
    modelId?: number;
    audioPath?: string;
    param?: string;
    code?: string;
    progress?: number;
    name?: string;
    duration?: string;
    textContent?: string;
    voiceId?: number;
  }

  export interface SaveResponse {
    id: number;
  }

  // 查询视频
  export interface FindRequest {
    id: number;
  }

  export interface FindResponse {
    item: Video;
  }

  // 根据状态查询
  export interface FindByStatusRequest {
    status: string;
  }

  export interface FindByStatusResponse {
    item: Video;
  }

  // 根据状态查询列表
  export interface SelectByStatusRequest {
    status: string;
  }

  export interface SelectByStatusResponse {
    list: Video[];
  }

  // 删除
  export interface DeleteRequest {
    id: number;
  }

  // 分页查询
  export interface PageResponse {
    total: number;
    list: Video[];
  }

  // 统计
  export interface CountRequest {
    name?: string;
  }

  export interface CountResponse {
    count: number;
  }

  // 合成视频
  export interface MakeByF2FRequest {
    id: number;
  }
}

// 语音管理 API
export namespace VoiceApi {
  // 保存语音
  export interface SaveRequest {
    file: File;
    name?: string;
    audioText?: string;
  }

  export interface SaveResponse {
    id: number;
    audioPath: string;
  }

  // 查询语音
  export interface FindRequest {
    id: number;
  }

  export interface FindResponse {
    Item: Voice;
  }

  // 分页查询
  export interface PageResponse {
    total: number;
    list: Voice[];
  }
}

// TTS API
export namespace TtsApi {
  // 声音克隆
  export interface InvokeRequest {
    voiceId: number;
    text: string;
    responseType?: string;
  }

  // 语音识别
  export interface TrainRequest {
    file: File;
  }

  export interface TrainResponse {
    success: boolean;
    text: string;
    message?: string;
  }
}

// 文件相关类型
export interface UploadFile {
  file: File;
}

// HTTP请求配置
export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  timeout?: number;
}
