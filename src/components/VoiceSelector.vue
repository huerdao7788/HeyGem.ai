<template>
  <div class="voice-selector">
    <t-select
      v-model="selectedVoiceId"
      :loading="voiceStore.loading"
      :placeholder="placeholder"
      :empty="emptyText"
      clearable
      filterable
      @change="handleVoiceChange"
    >
      <template #prefixIcon>
        <audio-icon />
      </template>

      <t-option
        v-for="item in voiceStore.voiceList"
        :key="item.id"
        :value="item.id"
        :label="item.name"
      >
        <div class="voice-option">
          <span class="voice-name">{{ item.name }}</span>
          <audio
            class="voice-preview"
            :src="item.audioPath"
            controls
            @click.stop
          ></audio>
        </div>
      </t-option>

      <template #panel-footer>
        <div class="voice-footer">
          <t-button
            theme="primary"
            variant="text"
            @click.stop="showVoiceManagement"
          >
            管理音色
          </t-button>
          <t-button
            theme="primary"
            variant="text"
            @click.stop="refreshVoiceList"
          >
            刷新列表
          </t-button>
        </div>
      </template>
    </t-select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, defineProps, defineEmits } from 'vue';
import { AudioIcon } from 'tdesign-icons-vue-next';
import { useRouter } from 'vue-router';
import { useVoiceStore } from '@/stores/voice';
import { Voice } from '@/api/types';

const props = defineProps({
  modelValue: {
    type: Number,
    default: undefined
  },
  placeholder: {
    type: String,
    default: '请选择音色'
  },
  emptyText: {
    type: String,
    default: '暂无音色，请先添加'
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const router = useRouter();
const voiceStore = useVoiceStore();
const selectedVoiceId = ref<number | undefined>(props.modelValue);

// 监听外部传入的值变化
watch(() => props.modelValue, (newVal) => {
  selectedVoiceId.value = newVal;
});

// 监听内部选中值变化，同步到外部
watch(() => selectedVoiceId.value, (newVal) => {
  emit('update:modelValue', newVal);
});

// 页面加载时获取音色列表
onMounted(() => {
  refreshVoiceList();
});

// 刷新音色列表
const refreshVoiceList = async () => {
  await voiceStore.fetchVoiceList();
};

// 处理音色变更
const handleVoiceChange = (value: number) => {
  const selectedVoice = voiceStore.voiceList.find(item => item.id === value);
  emit('change', selectedVoice);
};

// 跳转到音色管理页面
const showVoiceManagement = () => {
  router.push('/voice/management');
};
</script>

<style scoped>
.voice-selector {
  width: 100%;
}

.voice-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.voice-name {
  font-weight: normal;
  margin-right: 12px;
}

.voice-preview {
  height: 24px;
}

.voice-footer {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-top: 1px solid #e7e7e7;
}
</style>
