import request from './request';
import { ApiResponse, Model, ModelApi, PageParams } from './types';

const apiUrl = '/v1/model';

/**
 * 模特分页查询
 * @param param 分页参数
 * @returns 分页结果
 */
export const modelPage = async (param: PageParams): Promise<ModelApi.PageResponse> => {
  const searchParams = new URLSearchParams(param as any);
  const { data } = await request.get(`${apiUrl}/page?${searchParams}`);
  return data;
};

/**
 * 模特数量统计
 * @param param 查询参数
 * @returns 统计结果
 */
export const modelCount = async (param: ModelApi.CountRequest): Promise<ApiResponse<ModelApi.CountResponse>> => {
  const searchParams = new URLSearchParams(param as any);
  return request.get(`${apiUrl}/count?${searchParams}`);
};

/**
 * 添加模特
 * @param param 模特信息
 * @returns 添加结果
 */
export const modelAdd = async (param: ModelApi.AddRequest | FormData): Promise<ApiResponse<ModelApi.AddResponse>> => {
  // 处理FormData对象或其他参数
  let requestData: any = param;
  let config: any = {};

  // 如果参数不是FormData，需要构建FormData
  if (!(param instanceof FormData)) {
    // 创建新的FormData
    const formData = new FormData();

    // 将普通对象的属性添加到FormData中
    Object.keys(param as object).forEach(key => {
      const value = (param as any)[key];
      // 处理文件对象
      if (value instanceof File) {
        formData.append('file', value);
      } else {
        formData.append(key, value);
      }
    });

    requestData = formData;
  }

  // 为FormData请求设置正确的头部
  if (requestData instanceof FormData) {
    config.headers = {
      'Content-Type': 'multipart/form-data'
    };
  }

  return request.post(`${apiUrl}/add`, requestData, config);
};

/**
 * 查询单个模特
 * @param param 查询参数
 * @returns 模特信息
 */
export const modelFind = async (param: ModelApi.FindRequest): Promise<ApiResponse<ModelApi.FindResponse>> => {
  const searchParams = new URLSearchParams(param as any);
  return request.get(`${apiUrl}/find?${searchParams}`);
};

/**
 * 删除模特
 * @param param 删除参数
 * @returns 删除结果
 */
export const modelDel = async (param: ModelApi.DeleteRequest): Promise<ApiResponse<any>> => {
  const searchParams = new URLSearchParams(param as any);
  return request.delete(`${apiUrl}/del?${searchParams}`);
};
