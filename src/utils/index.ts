import dayjs from 'dayjs';
import { getAssetUrl } from './url';

export const handleShowMenu = (path: string): boolean => {
  const MenuList = ['/video/edit', '/login'];
  if (MenuList.find((item) => path.includes(item))) {
    return true;
  } else {
    return false;
  }
};

export const wait = (time = 0): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, time * 1000);
  });
};

export const localUrl = {
  addFileProtocol(url: string): string {
    return url && `file://${url}`.replace(/\\/g, "/");
  },

  delFileProtocol(url: string): string {
    return url && url.replace('file://', '');
  }
};

export const formatDate = (time: Date | string = new Date(), pattern = 'YYYY-MM-DD HH:mm:ss'): string => {
  return dayjs(time).format(pattern);
};

export const handlePath = (path: string): string => {
  // 更新为使用统一的资源URL处理函数
  return getAssetUrl(path);
};

export const millisecondsToTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const remainingSecondsAfterHours = totalSeconds % 3600;
  const minutes = Math.floor(remainingSecondsAfterHours / 60);
  const seconds = remainingSecondsAfterHours % 60;
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

export const getUniqueId = (): string => {
  return Date.now() + Math.random().toString(36).substring(2, 15);
};

// 导出URL处理工具函数
export { getAssetUrl };
