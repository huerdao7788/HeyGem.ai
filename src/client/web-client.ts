// Web端文件操作API实现
// 使用浏览器原生的File API来模拟Electron的文件操作功能

// 定义过滤器接口
export interface FileFilter {
  name?: string;
  extensions?: string[];
}

// 定义文件API接口
export interface FileAPI {
  name: string;
  selectFile: (filters?: FileFilter) => Promise<File | null>;
  saveFile: (content: BlobPart, defaultName?: string) => Promise<string>;
}

// 定义应用API接口
export interface AppAPI {
  name: string;
}

// 定义客户端API接口
export interface WebClientAPI {
  file: FileAPI;
  app: AppAPI;
}

// 文件处理 API
const file: FileAPI = {
  name: 'file',

  // 选择文件
  async selectFile(filters: FileFilter = {}): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';

      // 处理文件过滤
      if (filters.extensions && filters.extensions.length) {
        input.accept = filters.extensions.map(ext => `.${ext}`).join(',');
      }

      input.onchange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
          // 返回文件对象而不仅仅是文件名，以便正确处理上传
          resolve(file);
        } else {
          resolve(null);
        }
      };

      // 触发文件选择对话框
      input.click();
    });
  },

  // 保存文件
  async saveFile(content: BlobPart, defaultName = ''): Promise<string> {
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = defaultName || 'download';
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();

    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    return defaultName;
  }
};

// 应用API（Web环境下简化）
const app: AppAPI = {
  name: 'app'
};

// 导出Web客户端API
const webClient: WebClientAPI = {
  file,
  app
};

export default webClient;
