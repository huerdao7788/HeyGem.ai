import { serviceUrl } from '../config';
import { modelAdd, modelCount, modelDel, modelFind, modelPage } from '../api/model';
import { getAssetUrl } from '../utils/url';

// 模型数据类型
interface ModelItem {
  id: string | number;
  name: string;
  videoPath: string;
  audioPath?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: any;
}

// 分页参数类型
interface ModelPageParams {
  page: number | string;
  pageSize: number | string;
  name?: string;
}

// 分页结果类型
interface ModelPageResult {
  total: number;
  list: ModelItem[];
}

/**
 * 新增模特
 * @param modelName 模特名称
 * @param videoPath 模特视频路径或文件对象
 * @returns 模特ID
 */
export async function addModel(modelName: string, videoPath: string | File): Promise<string | number> {
  // 创建FormData对象
  const formData = new FormData();
  formData.append('name', modelName);

  // 处理File对象
  if (videoPath instanceof File) {
    formData.append('file', videoPath);
    const res = await modelAdd(formData);
    return res.data.id;
  }
  // 处理Blob URL
  else if (typeof videoPath === 'string' && videoPath.startsWith('blob:')) {
    try {
      const response = await fetch(videoPath);
      const blob = await response.blob();
      const file = new File([blob], 'video.mp4', { type: 'video/mp4' });
      formData.append('file', file);
      const res = await modelAdd(formData);
      return res.data.id;
    } catch (error) {
      console.error('处理Blob URL失败:', error);
      throw error;
    }
  }
  // 处理字符串路径（兼容旧代码）
  else if (typeof videoPath === 'string') {
    // 创建文件选择器
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    return new Promise<string | number>((resolve, reject) => {
      fileInput.onchange = async () => {
        if (fileInput.files && fileInput.files[0]) {
          formData.append('file', fileInput.files[0]);
          try {
            const res = await modelAdd(formData);
            resolve(res.data.id);
          } catch (error) {
            reject(error);
          } finally {
            document.body.removeChild(fileInput);
          }
        } else {
          reject(new Error('未选择文件'));
          document.body.removeChild(fileInput);
        }
      };
      fileInput.click();
    });
  }
  // 其他情况（出错处理）
  else {
    throw new Error('无效的视频文件或路径');
  }
}

/**
 * 模特分页查询
 * @param params 分页参数
 * @returns 分页结果
 */
export async function page(params: ModelPageParams): Promise<ModelPageResult> {
  const pageParams: any = {
    page: typeof params.page === 'string' ? parseInt(params.page, 10) : params.page,
    pageSize: typeof params.pageSize === 'string' ? parseInt(params.pageSize, 10) : params.pageSize,
    name: params.name
  };

  let { total, list } = await modelPage(pageParams);

  return {
    total,
    list: list || []
  };
}

/**
 * 查询单个模特
 * @param modelId 模特ID
 * @returns 模特详情
 */
export async function findModel(modelId: string | number): Promise<ModelItem> {
  // 确保ID是数字类型
  const id = typeof modelId === 'string' ? parseInt(modelId, 10) : modelId;
  const { data } = await modelFind({ id });
  return data.item;
}

/**
 * 删除模特
 * @param modelId 模特ID
 * @returns 操作结果
 */
export async function removeModel(modelId: string | number): Promise<void> {
  // 确保ID是数字类型
  const id = typeof modelId === 'string' ? parseInt(modelId, 10) : modelId;
  await modelDel({ id });
}

/**
 * 统计模特数量
 * @param name 模特名称
 * @returns 模特数量
 */
export async function countModel(name: string = ''): Promise<number> {
  const res = await modelCount({ name: name });
  return res.data.count;
}
