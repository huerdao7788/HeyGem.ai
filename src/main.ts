import './assets/main.css'
import TDesign from 'tdesign-vue-next'
import { createApp, type App as VueApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import i18n from "./i18n/index";
import webClient from './client';
// 引入组件库的少量全局样式变量
import 'tdesign-vue-next/es/style/index.css'

const app: VueApp = createApp(App);

// 提供客户端API给全局
app.provide('client', webClient);

// 为兼容性考虑，将client挂载到window对象
// 添加扩展声明，使TypeScript识别客户端属性
declare global {
  interface Window {
    client: typeof webClient;
  }
}
window.client = webClient;

app.use(router).use(createPinia()).use(TDesign).use(i18n).mount('#app')
