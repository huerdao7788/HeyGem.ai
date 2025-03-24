<template>
  <div class="preview">
    <div class="preview-header">{{ $t('common.preview.headerText') }}</div>
    <div class="preview-body">
      <video v-if="model.videoPath" class="video" controls :src="handlePath(model.videoPath)"></video>
    </div>
  </div>
</template>
<script setup lang="ts">
import { PropType } from 'vue';
import { Loading as TLoading } from 'tdesign-vue-next';
import { handlePath } from '@renderer/utils';
// 定义模型接口
interface ModelInfo {
  id?: string | number
  name?: string
  videoPath?: string
  [key: string]: any
}

defineProps({
  model: {
    type: Object as PropType<ModelInfo>,
    default: () => ({})
  }
})
</script>
<style lang="less" scoped>
.preview {
  display: flex;
  height: 100%;
  flex-direction: column;
  border-left: 1px solid #000000;
  border-right: 1px solid #000000;

  &-header {
    font-weight: 500;
    padding: 18px;
    font-size: 14px;
    color: #ffffff;
    line-height: 22px;
    text-align: center;
    border-bottom: 1px solid #000000;
  }

  &-body {
    flex: 1;
    width: 100%;
    height: 100%;
    padding: 0 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #161718;
    padding: 40px;
    overflow: hidden;

    .video {
      max-width: 100%;
      max-height: 100%;
      border-radius: 4px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
