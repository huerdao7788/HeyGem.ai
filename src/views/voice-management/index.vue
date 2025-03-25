<template>
  <div class="voice-management-container">
    <t-card title="音色管理" bordered>
      <!-- 操作栏 -->
      <div class="operation-bar">
        <t-space>
          <t-input
            v-model="searchKeyword"
            placeholder="请输入音色名称"
            clearable
            @clear="handleSearch"
            @enter="handleSearch"
          >
            <template #suffix-icon>
              <search-icon />
            </template>
          </t-input>
          <t-button theme="primary" @click="showUploadDialog = true">上传新音色</t-button>
        </t-space>
      </div>

      <!-- 音色列表 -->
      <t-table
        :data="voiceStore.voiceList"
        :loading="voiceStore.loading"
        row-key="id"
        :columns="columns"
        :pagination="{
          total: voiceStore.total,
          pageSize: voiceStore.pageSize,
          current: voiceStore.currentPage,
          onPageChange: voiceStore.onPageChange,
          onPageSizeChange: voiceStore.onPageSizeChange
        }"
        @row-click="handleRowClick"
      >
        <!-- 音色试听列 -->
        <template #audioPath="{ row }">
          <div class="audio-player">
            <audio controls :src="getAssetUrl(row.audioPath)" style="height: 30px;">
              您的浏览器不支持音频播放
            </audio>
          </div>
        </template>

        <!-- 文本内容列 -->
        <template #audioText="{ row }">
          <t-tooltip
            v-if="row.audioText && row.audioText.length > 20"
            :content="row.audioText"
            placement="top"
            show-arrow
            theme="light"
          >
            <span class="truncated-text">{{ truncateText(row.audioText, 20) }}</span>
          </t-tooltip>
          <span v-else>{{ row.audioText || '-' }}</span>
        </template>

        <!-- 创建时间列 -->
        <template #createdAt="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>

        <!-- 操作列 -->
        <template #operation="{ row }">
          <t-space>
            <t-button variant="text" theme="danger" @click.stop="handleDelete(row)">
              删除
            </t-button>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <!-- 上传音色对话框 -->
    <t-dialog
      v-model:visible="showUploadDialog"
      header="上传新音色"
      :footer="false"
      width="500px"
      @close="resetUploadForm"
    >
      <t-form ref="form" :data="formData" :rules="rules" @submit="handleSubmit">
        <t-form-item label="音色名称" name="name" required>
          <t-input v-model="formData.name" placeholder="请输入音色名称" />
        </t-form-item>
        <t-form-item label="音频文件" name="file" required>
          <div class="upload-section">
            <div class="upload-controls">
              <t-upload
                v-model="formData.file"
                theme="file"
                accept="audio/*"
                :multiple="false"
                :auto-upload="false"
                :files-list-display="false"
                @change="handleFileChange"
                class="audio-upload"
              />
            </div>

            <div class="recognize-controls">
              <t-checkbox v-model="autoRecognizeText" class="auto-recognize-checkbox">
                自动识别语音内容
              </t-checkbox>
              <t-loading v-if="recognizing" size="small" />
            </div>

            <!-- 音频预览播放器 -->
            <div v-if="audioPreviewUrl" class="audio-preview-container" @click.stop>
              <div class="audio-controls" @click.stop>
                <t-button
                  class="audio-play-btn"
                  theme="default"
                  shape="circle"
                  variant="text"
                  size="small"
                  @click.stop="toggleAudioPlay"
                  @mousedown.stop
                  @mouseup.stop
                >
                  <template #icon>
                    <img :src="isAudioPlaying ? PauseIcon : PlayIcon" alt="播放/暂停" class="play-icon" />
                  </template>
                </t-button>

                <div class="audio-progress" @click.stop>
                  <div class="progress-bar">
                    <div class="progress-track" :style="{ width: `${audioProgress}%` }"></div>
                  </div>
                  <div class="progress-time">
                    <span>{{ formatTime(currentAudioTime) }}</span>
                    <span>{{ formatTime(totalAudioTime) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </t-form-item>
        <t-form-item label="文本内容" name="audioText" required>
          <t-textarea
            v-model="formData.audioText"
            placeholder="请输入此音频的文本内容（用于语音克隆）"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </t-form-item>
        <t-form-item>
          <t-space>
            <t-button theme="primary" type="submit" :loading="uploading">
              确认上传
            </t-button>
            <t-button theme="default" variant="base" @click="handleCancelUpload">
              取消
            </t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 删除确认对话框 -->
    <t-dialog
      v-model:visible="showDeleteDialog"
      header="删除音色"
      :body="'确定要删除音色 「' + (voiceToDelete?.name || '') + '」 吗？'"
      @confirm="confirmDelete"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, h, onMounted, onBeforeUnmount, watch } from 'vue';
import { useVoiceStore } from '@/stores/voice';
import { SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next';
import { Voice } from '@/api/types';
import { saveAudio } from '@/service/voice';
import dayjs from 'dayjs';
import { getAssetUrl } from '@/utils/url';
// 导入播放器图标
import PlayIcon from '@renderer/assets/images/icons/icon-play.png'
import PauseIcon from '@renderer/assets/images/icons/icon-pause.png'



// 声明列表列配置
const columns = [
  { colKey: 'id', title: 'ID', width: 80 },
  { colKey: 'name', title: '音色名称', width: 180 },
  { colKey: 'audioPath', title: '音色试听', width: 250 },
  { colKey: 'audioText', title: '文本内容', width: 200 },
  { colKey: 'createdAt', title: '创建时间', width: 180 },
  { colKey: 'operation', title: '操作', width: 100, fixed: 'right' }
];

// 引入状态管理
const voiceStore = useVoiceStore();

// 搜索关键字
const searchKeyword = ref('');

// 上传对话框状态
const showUploadDialog = ref(false);
const formData = ref({
  name: '',
  file: [] as any[],
  audioText: ''
});
const rules = {
  name: [{ required: true, message: '请输入音色名称', type: 'error' }],
  file: [{ required: true, message: '请上传音频文件', type: 'error' }],
  audioText: [{ required: true, message: '请输入音频文本内容', type: 'error' }]
};
const uploading = ref(false);
const audioPreviewUrl = ref<string>('');
const autoRecognizeText = ref(false);
const recognizing = ref(false);

// 音频播放器状态
const audioElement = ref<HTMLAudioElement | null>(null);
const isAudioPlaying = ref(false);
const audioDuration = ref('');
const audioProgress = ref(0);
const currentAudioTime = ref(0);
const totalAudioTime = ref(0);

// 删除对话框状态
const showDeleteDialog = ref(false);
const voiceToDelete = ref<Voice | null>(null);

// 格式化日期
const formatDate = (dateStr: string) => {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss');
};

// 截断文本
const truncateText = (text: string, maxLength: number) => {
  if (!text) return '-';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// 页面加载时获取音色列表
onMounted(() => {
  voiceStore.fetchVoiceList();
});

// 处理音色点击事件
const handleRowClick = (row: Voice) => {
  // 可以在这里实现预览或其他操作
  console.log('点击了音色:', row);
};

// 处理音色删除
const handleDelete = (row: Voice) => {
  voiceToDelete.value = row;
  showDeleteDialog.value = true;
};

// 确认删除
const confirmDelete = async () => {
  if (voiceToDelete.value) {
    await voiceStore.deleteVoice(voiceToDelete.value.id);
    showDeleteDialog.value = false;
    voiceToDelete.value = null;
  }
};

// 处理搜索
const handleSearch = () => {
  voiceStore.searchVoice(searchKeyword.value);
};

// 监听音频预览URL变化
watch(audioPreviewUrl, (url) => {
  if (url) {
    // 创建新的音频元素
    audioElement.value = new Audio(url);

    // 监听加载事件
    audioElement.value.addEventListener('loadedmetadata', handleAudioLoaded);

    // 监听播放进度
    audioElement.value.addEventListener('timeupdate', handleTimeUpdate);

    // 监听播放结束
    audioElement.value.addEventListener('ended', handleAudioEnded);
  } else if (audioElement.value) {
    // 清除已有的音频元素
    stopAudio();
    audioElement.value.removeEventListener('loadedmetadata', handleAudioLoaded);
    audioElement.value.removeEventListener('timeupdate', handleTimeUpdate);
    audioElement.value.removeEventListener('ended', handleAudioEnded);
    audioElement.value = null;
  }
});

// 音频加载完成
const handleAudioLoaded = () => {
  if (audioElement.value) {
    totalAudioTime.value = audioElement.value.duration;
    audioDuration.value = formatTime(totalAudioTime.value);
  }
};

// 音频时间更新
const handleTimeUpdate = () => {
  if (audioElement.value) {
    currentAudioTime.value = audioElement.value.currentTime;
    audioProgress.value = (currentAudioTime.value / totalAudioTime.value) * 100;
  }
};

// 音频播放结束
const handleAudioEnded = () => {
  isAudioPlaying.value = false;
  audioProgress.value = 0;
  currentAudioTime.value = 0;
  if (audioElement.value) {
    audioElement.value.currentTime = 0;
  }
};

// 播放/暂停音频
const toggleAudioPlay = (event?: Event) => {
  // 彻底阻止事件传播
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  if (!audioElement.value) return;

  // 使用setTimeout确保事件处理先完成
  setTimeout(() => {
    if (isAudioPlaying.value) {
      audioElement.value!.pause();
      isAudioPlaying.value = false;
    } else {
      // 添加播放错误处理
      const playPromise = audioElement.value!.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isAudioPlaying.value = true;
          })
          .catch(error => {
            console.error('播放失败:', error);
            MessagePlugin.error('音频播放失败');
          });
      } else {
        isAudioPlaying.value = true;
      }
    }
  }, 0);
};

// 停止音频播放
const stopAudio = () => {
  if (!audioElement.value) return;

  audioElement.value.pause();
  audioElement.value.currentTime = 0;
  isAudioPlaying.value = false;
  audioProgress.value = 0;
  currentAudioTime.value = 0;
};

// 格式化时间
const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '00:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 从URL获取文件名
const getFileNameFromUrl = (url: string): string => {
  if (!url) return '未命名';

  if (formData.value.file.length > 0 && formData.value.file[0].raw) {
    return formData.value.file[0].raw.name;
  }

  // 尝试从URL提取文件名
  const parts = url.split('/');
  const fileName = parts[parts.length - 1].split('?')[0];
  return fileName || '音频文件';
};

// 处理音频文件变更
const handleFileChange = async (files: any) => {
  if (files.length > 0) {
    const file = files[0].raw;
    // 如果之前有创建的URL，先销毁
    if (audioPreviewUrl.value) {
      URL.revokeObjectURL(audioPreviewUrl.value);
    }

    // 停止正在播放的音频
    stopAudio();

    // 为新选择的文件创建一个临时URL
    audioPreviewUrl.value = URL.createObjectURL(file);

    // 如果开启了自动识别，则调用识别接口
    if (autoRecognizeText.value) {
      await recognizeAudioText(file);
    }
  } else {
    // 如果没有文件，清除预览URL
    if (audioPreviewUrl.value) {
      URL.revokeObjectURL(audioPreviewUrl.value);
      audioPreviewUrl.value = '';
    }
  }
};

// 识别音频文本内容
const recognizeAudioText = async (file: File) => {
  try {
    recognizing.value = true;

    // 使用store中的识别方法
    const recognizedText = await voiceStore.recognizeVoiceText(file);

    // 处理识别结果
    if (recognizedText) {
      // 防止覆盖用户已输入的内容
      if (!formData.value.audioText) {
        formData.value.audioText = recognizedText;
        MessagePlugin.success('语音内容识别成功');
      } else {
        // 如果已有内容，使用对话框询问是否替换
        DialogPlugin.confirm({
          header: '替换文本确认',
          body: '检测到您已输入文本内容，是否替换为识别结果？',
          confirmBtn: {
            content: '替换',
            theme: 'primary',
          },
          cancelBtn: '保留现有内容',
          onConfirm: () => {
            formData.value.audioText = recognizedText;
          }
        });
      }
    }
  } catch (error) {
    console.error('语音识别处理失败:', error);
  } finally {
    recognizing.value = false;
  }
};

// 重置上传表单
const resetUploadForm = () => {
  formData.value = {
    name: '',
    file: [],
    audioText: ''
  };
  autoRecognizeText.value = false;
  recognizing.value = false;

  // 停止音频播放
  stopAudio();

  // 清理临时URL
  if (audioPreviewUrl.value) {
    URL.revokeObjectURL(audioPreviewUrl.value);
    audioPreviewUrl.value = '';
  }
};

// 处理取消上传
const handleCancelUpload = () => {
  showUploadDialog.value = false;
  resetUploadForm();
};

// 组件销毁前清理资源
onBeforeUnmount(() => {
  if (audioElement.value) {
    audioElement.value.removeEventListener('loadedmetadata', handleAudioLoaded);
    audioElement.value.removeEventListener('timeupdate', handleTimeUpdate);
    audioElement.value.removeEventListener('ended', handleAudioEnded);
  }

  if (audioPreviewUrl.value) {
    URL.revokeObjectURL(audioPreviewUrl.value);
  }
});

// 处理表单提交
const handleSubmit = async ({ validateResult }: { validateResult: any }) => {
  if (validateResult === true) {
    uploading.value = true;
    try {
      // 获取表单数据
      const file = formData.value.file[0].raw as File;
      const name = formData.value.name;
      const audioText = formData.value.audioText;

      // 创建Blob URL以便传给saveAudio
      const blobUrl = URL.createObjectURL(file);

      // 直接调用service层的方法保存音色
      await saveAudio(blobUrl, name, "true", audioText);

      // 刷新音色列表
      await voiceStore.fetchVoiceList();

      // 关闭对话框并重置表单
      showUploadDialog.value = false;
      resetUploadForm();

      // 提示上传成功
      MessagePlugin.success('音色上传成功');
    } catch (error) {
      console.error('上传失败:', error);
      MessagePlugin.error('上传失败，请重试');
    } finally {
      uploading.value = false;
    }
  }
};
</script>

<style scoped>
.voice-management-container {
  padding: 20px;
}

.operation-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
}

.upload-section {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
}

.upload-controls {
  display: flex;
  width: 100%;
}

.audio-upload {
  width: 100%;
}

.recognize-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.auto-recognize-checkbox {
  margin: 0;
}

.audio-player {
  width: 220px;
}

.truncated-text {
  cursor: pointer;
  color: #333;
  border-bottom: 1px dashed #ccc;
}

.audio-preview-container {
  margin-top: 8px;
  padding: 8px 10px;
  background-color: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #eee;
  width: 100%;
  display: block;
}

.audio-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 30px;
}

.audio-play-btn {
  min-width: 30px !important;
  width: 30px !important;
  height: 30px !important;
  padding: 0 !important;
  background-color: #eee !important;
  transition: background-color 0.2s;
}

.audio-play-btn:hover {
  background-color: #e0e0e0 !important;
}

.play-icon {
  width: 16px;
  height: 16px;
}

.audio-progress {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.progress-bar {
  height: 4px;
  background-color: #ddd;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.progress-track {
  position: absolute;
  height: 100%;
  background-color: #309cff;
  border-radius: 2px;
  top: 0;
  left: 0;
  transition: width 0.1s;
}

.progress-time {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}
</style>
