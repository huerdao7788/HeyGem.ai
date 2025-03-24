import { createApp } from 'vue';
import TDesign from 'tdesign-vue-next';
import ModelCreateView from './ModelCreateView.vue';
import i18n from "@renderer/i18n";

// 导出组件以便组件式调用
export { default as ModalBox } from './ModalBox.vue';
export { default as ModalBoxUpload } from './ModalBoxUpload.vue';
export { ModelCreateView };

// 定义模型创建结果接口
export interface ModelCreateResult {
  isSubmitOK?: boolean;
  [key: string]: any;
}

// 定义模型创建选项接口
export interface ModelCreateOptions {
  visible?: boolean;
  [key: string]: any;
}

// 命令式调用，返回 Promise
export const createModel = (props: ModelCreateOptions = {}): Promise<ModelCreateResult> => {
  const rootNode = document.createElement('div');
  document.body.appendChild(rootNode);

  return new Promise<ModelCreateResult>((resolve) => {
    const options = {
      ...props,
      visible: true,
      onClose(result: ModelCreateResult) {
        resolve(result);
      },
      onClosed: () => {
        app.unmount();
        document.body.removeChild(rootNode);
      }
    };

    const app = createApp(ModelCreateView, options).use(TDesign).use(i18n);
    app.mount(rootNode);
  });
};
