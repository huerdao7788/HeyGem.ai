import './assets/main.css'
import TDesign from 'tdesign-vue-next'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import i18n from "./i18n/index.js";
import client from './client';
// 引入组件库的少量全局样式变量
import 'tdesign-vue-next/es/style/index.css'

const app = createApp(App);

// 提供客户端API给全局
app.provide('client', client);

// 为兼容性考虑，将client挂载到window对象
window.client = client;

app.use(router).use(createPinia()).use(TDesign).use(i18n).mount('#app')
