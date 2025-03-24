import { createI18n } from 'vue-i18n';
import en from './config/en';
import zh from './config/zh';
import { createPinia } from 'pinia';
import { useHomeStore } from "../stores/home";

// 创建Pinia实例，用于获取当前语言设置
const pinia = createPinia();
const home = useHomeStore(pinia);

// 国际化消息集合
const messages = {
  en,
  zh
};

// 创建I18n实例
const i18n = createI18n({
  legacy: false,         // 使用Composition API模式
  globalInjection: true, // 全局注入$t方法
  locale: home.homeState.language, // 从store获取当前语言
  messages
});

export default i18n;
