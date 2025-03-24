/// <reference types="vite/client" />

// 声明环境变量类型
interface ImportMetaEnv {
  readonly VITE_API_TARGET: string;
  readonly VITE_API_BASE_URL: string;
  // 添加其他环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 声明.vue文件模块
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<never, never, never>;
  export default component;
}
