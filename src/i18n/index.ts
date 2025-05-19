import { createI18n } from 'vue-i18n';
import messages from './config/index';
import { createPinia } from 'pinia';
import { useHomeStore } from "../stores/home";

// 从 localStorage 获取语言设置
const getDefaultLanguage = () => {
  const savedLanguage = localStorage.getItem('language');
  return savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en') ? savedLanguage : 'zh';
};

// 创建Pinia实例，用于获取当前语言设置
const pinia = createPinia();
const home = useHomeStore(pinia);

// 确保 store 中的语言设置与 localStorage 一致
const language = getDefaultLanguage();
home.setLanguage(language);

// 创建I18n实例
const i18n = createI18n({
  legacy: false,         // 使用Composition API模式
  globalInjection: true, // 全局注入$t方法
  locale: language,      // 使用从localStorage获取的语言设置
  fallbackLocale: 'zh',  // 备用语言为中文
  messages
});

export default i18n;
