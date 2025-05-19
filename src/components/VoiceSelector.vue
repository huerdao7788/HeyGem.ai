<template>
  <div class="voice-selector">
    <t-select
      v-model="selectedVoiceId"
      :loading="loading"
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
        v-for="item in voiceList"
        :key="item.id"
        :value="item.id"
        :label="item.name"
      >
        <div class="voice-option">
          <span class="voice-name">{{ item.name }}</span>
          <audio
            v-if="item.audioPath"
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
            @click.stop="refreshVoiceList"
          >
            {{ refreshButtonText }}
          </t-button>
        </div>
      </template>
    </t-select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { AudioIcon } from 'tdesign-icons-vue-next';
import voiceApi from '@/api/voice/index';
import { useI18n } from 'vue-i18n';

// 使用国际化
const { t } = useI18n();

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: undefined
  },
  placeholder: {
    type: String,
    default: '请选择音色'
  },
  emptyText: {
    type: String,
    default: '暂无音色，请先添加'
  },
  refreshButtonText: {
    type: String,
    default: '刷新列表'
  },
  externalVoices: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const loading = ref(false);
const voiceList = ref<any[]>([]);
const selectedVoiceId = ref<number | string | undefined>(props.modelValue);

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
  loading.value = true;
  try {
    // 获取克隆的音色
    const clonedVoices = voiceApi.getClonedVoices();
    
    // 将克隆的音色格式化为选项
    const clonedOptions = clonedVoices.map(voice => ({
      id: voice.voiceId,
      name: `${voice.name} (${t('common.voiceSynthesis.voiceCloning')})`,
      audioPath: voice.sampleUrl,
      isCloned: true
    }));
    
    // 获取系统音色
    let systemVoices: any[] = [];
    
    // 优先使用外部传入的音色列表
    if (props.externalVoices && props.externalVoices.length > 0) {
      systemVoices = props.externalVoices;
    } else {
      try {
        const voices = await voiceApi.getSystemVoices();
        console.log('获取到系统音色:', voices);

        // 处理MiniMax官方音色格式
        systemVoices = voices.map((voice: any) => {
          // 尝试解析voice_id或id
          const voiceId = voice.voice_id || voice.id || voice.voiceId || '';
          
          // 由于不存在预览音频，使用null作为默认值
          const previewUrl = voice.sampleUrl || voice.audioUrl || null;
          
          return {
            id: voiceId,
            name: formatVoiceName(voice),
            audioPath: previewUrl,
            isSystem: true,
            // 保存原始数据，便于调试
            original: voice
          };
        });
      } catch (error) {
        console.error('获取系统音色列表失败:', error);
      }
    }
    
    // 合并音色列表
    voiceList.value = [...clonedOptions, ...systemVoices];
  } catch (error) {
    console.error('刷新音色列表错误:', error);
  } finally {
    loading.value = false;
  }
};

// 格式化音色名称，显示更友好的名称
const formatVoiceName = (voice: any): string => {
  // 获取名称
  const name = voice.name || voice.displayName || '';
  
  // 尝试获取语言和性别信息
  const tags = voice.tags || [];
  const language = voice.language || tags.find((tag: string) => ['中文', '英文', '日语', '韩语'].includes(tag)) || '';
  const gender = voice.gender || '';
  
  let formattedName = name;
  
  // 为音色名称添加更多信息
  let genderText = '';
  if (gender === 'male') {
    genderText = t('common.voiceSynthesis.male');
  } else if (gender === 'female') {
    genderText = t('common.voiceSynthesis.female');
  }
  
  if (language || genderText) {
    formattedName += ` (${language}${genderText ? ' ' + genderText : ''})`;
  }
  
  return formattedName;
};

// 处理音色变更
const handleVoiceChange = (value: number | string) => {
  const selectedVoice = voiceList.value.find(item => item.id === value);
  emit('change', selectedVoice);
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
  justify-content: center;
  padding: 8px 0;
  border-top: 1px solid #e7e7e7;
}
</style>
