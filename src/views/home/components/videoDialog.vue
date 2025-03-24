<template>
  <div class="video-dialog-box">
    <t-dialog
      :width="400"
      v-if="props.showVideoDialog"
      :visible="props.showVideoDialog"
      top="10vh"
      :on-close="cancelUploda"
    >
      <template #footer>
        <span></span>
      </template>
      <div class="video-box">
        <video
          ref="videoPlayer"
          class="video-look"
          autoplay
          :src="handlePath(props.videoUrl)"
          controls
        ></video>
      </div>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { handlePath } from '@renderer/utils'

// 定义Props接口
interface VideoDialogProps {
  showVideoDialog: boolean
  videoUrl: string
}

const emit = defineEmits(['cancel']);
const props = defineProps<VideoDialogProps>();
const videoPlayer = ref<HTMLVideoElement | null>(null);

const cancelUploda = (): void => {
  emit("cancel");
  if (videoPlayer.value) {
    videoPlayer.value.pause();
  }
};
</script>
<style lang="less" scoped>
.video-box {
  display: flex;
  justify-items: center;
  align-items: center;
  .video-look {
    width: 100%;
  }
}
</style>
