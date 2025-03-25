import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Voice } from '@/api/types';
import { voicePage, voiceSave, voiceDelete  } from '@/api/voice';
import { train } from '@/api/tts';
import { MessagePlugin } from 'tdesign-vue-next';

export const useVoiceStore = defineStore('voice', () => {
  const voiceList = ref<Voice[]>([]);
  const loading = ref<boolean>(false);
  const total = ref<number>(0);
  const currentPage = ref<number>(1);
  const pageSize = ref<number>(10);
  const keyword = ref<string>('');
  const selectedVoice = ref<Voice | null>(null);
  const recognizing = ref<boolean>(false);

  // 获取音色列表
  const fetchVoiceList = async () => {
    loading.value = true;
    try {
      const response = await voicePage({
        page: currentPage.value,
        pageSize: pageSize.value,
        name: keyword.value
      });

      voiceList.value = response.list;
      total.value = response.total;
    } catch (error) {
      console.error('获取音色列表失败:', error);
      MessagePlugin.error('获取音色列表失败');
    } finally {
      loading.value = false;
    }
  };

  // 语音内容识别
  const recognizeVoiceText = async (file: File): Promise<string | null> => {
    recognizing.value = true;
    try {
      const result = await train(file);
      if (result.text) {
        return result.text;
      } else {
        MessagePlugin.warning(result.message || '未能识别出语音内容');
        return null;
      }
    } catch (error) {
      console.error('语音识别失败:', error);
      MessagePlugin.error('语音识别失败，请手动输入文本内容');
      return null;
    } finally {
      recognizing.value = false;
    }
  };

  // 上传并保存新音色
  const uploadVoice = async (file: File, name?: string, audioText?: string) => {
    loading.value = true;
    try {
      const formData = new FormData();
      formData.append('file', file);

      if (name) {
        formData.append('name', name);
      }

      if (audioText) {
        formData.append('audioText', audioText);
      }
      formData.append('save', 'true');
      const result = await voiceSave(formData);

      if (result.id) {
        MessagePlugin.success('音色上传成功');
        // 重新获取列表
        await fetchVoiceList();
        return result;
      }
    } catch (error) {
      console.error('音色上传失败:', error);
      MessagePlugin.error('音色上传失败');
    } finally {
      loading.value = false;
    }
  };

  // 选择音色
  const selectVoice = (voice: Voice) => {
    selectedVoice.value = voice;
  };

  // 清除选择
  const clearSelection = () => {
    selectedVoice.value = null;
  };

  // 搜索音色
  const searchVoice = async (searchText: string) => {
    keyword.value = searchText;
    currentPage.value = 1;
    await fetchVoiceList();
  };

  // 分页变化
  const onPageChange = async (page: number) => {
    currentPage.value = page;
    await fetchVoiceList();
  };

  // 每页数量变化
  const onPageSizeChange = async (size: number) => {
    pageSize.value = size;
    currentPage.value = 1;
    await fetchVoiceList();
  };

  // 删除音色
  const deleteVoice = async (id: number) => {
    try {
      const response = await voiceDelete(id);
      if (response.success) {
        MessagePlugin.success('音色删除成功');
        // 如果当前选中的音色被删除，清除选择
        if (selectedVoice.value && selectedVoice.value.id === id) {
          clearSelection();
        }
        await fetchVoiceList();
        return true;
      } else {
        MessagePlugin.error(response.message || '音色删除失败');
        return false;
      }
    } catch (error) {
      console.error('删除音色失败:', error);
      MessagePlugin.error('删除音色失败');
      return false;
    }
  };

  return {
    voiceList,
    loading,
    total,
    currentPage,
    pageSize,
    keyword,
    selectedVoice,
    recognizing,
    fetchVoiceList,
    uploadVoice,
    selectVoice,
    clearSelection,
    searchVoice,
    onPageChange,
    onPageSizeChange,
    deleteVoice,
    recognizeVoiceText
  };
});
