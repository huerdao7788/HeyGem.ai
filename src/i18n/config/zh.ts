import { commonZh } from '../components/common';

// 定义语言包类型
export interface LocaleMessages {
  common: typeof commonZh;
  [key: string]: any;
}

const messages: LocaleMessages = {
  common: commonZh
};

export default messages;
