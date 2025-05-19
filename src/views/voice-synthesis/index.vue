<template>
  <div class="voice-synthesis-container">
    <!-- 隐藏的元素，用于强制在语言变化时重新渲染 -->
    <div v-if="false">{{ langDependent }}</div>
    
    <div class="header">
      <h1>{{ $t('common.voiceSynthesis.title') }}</h1>
    </div>
    
    <div class="content-card">
      <t-tabs v-model="activeTab" theme="card">
        <t-tab-panel :value="'tts'" :label="$t('common.voiceSynthesis.tts')">
          <div class="tts-container">
            <div class="text-input-container">
              <t-textarea
                v-model="ttsText"
                :placeholder="$t('common.voiceSynthesis.textPlaceholder')"
                :autosize="{ minRows: 5, maxRows: 10 }"
                :maxlength="5000"
                :showCount="true"
              />
            </div>
            
            <div class="voice-settings">
              <div class="voice-selector-container">
                <div class="section-title">{{ $t('common.voiceSynthesis.voiceSelection') }}</div>
                <VoiceSelector
                  v-model="selectedVoiceId"
                  @change="handleVoiceChange"
                  :placeholder="$t('common.voiceSynthesis.selectVoice')"
                  :refresh-button-text="$t('common.voiceSynthesis.refreshList')"
                />
              </div>
              
              <div class="language-selector">
                <div class="section-title">{{ $t('common.voiceSynthesis.language') }}</div>
                <t-select v-model="selectedLanguage">
                  <t-option
                    v-for="lang in languages"
                    :key="lang.code"
                    :value="lang.code"
                    :label="lang.name"
                  />
                </t-select>
              </div>
              
              <div class="speed-control">
                <div class="section-title">{{ $t('common.voiceSynthesis.speed') }}</div>
                <div class="speed-control-row">
                  <t-slider
                    v-model="speed"
                    :min="0.5"
                    :max="2"
                    :step="0.1"
                    :tooltip-props="{ placement: 'top', content: `${formattedSpeed}x` }"
                    class="speed-slider"
                  />
                  <div class="speed-input-wrapper">
                    <t-input
                      v-model="formattedSpeedInput"
                      @blur="handleSpeedInputChange"
                      size="medium"
                      class="speed-input"
                    />
                    <span class="speed-unit">x</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="action-buttons">
              <t-button 
                theme="primary" 
                size="large" 
                :loading="synthesizing"
                :disabled="!canSynthesize"
                @click="handleSynthesize"
              >
                {{ $t('common.voiceSynthesis.synthesize') }}
              </t-button>
              
              <t-button 
                theme="default" 
                size="large" 
                :disabled="!audioUrl"
                @click="handleDownload"
              >
                {{ $t('common.voiceSynthesis.download') }}
              </t-button>
            </div>
            
            <div v-if="audioUrl" class="audio-player">
              <audio :src="audioUrl" controls></audio>
            </div>
          </div>
        </t-tab-panel>
        
        <t-tab-panel :value="'cloning'" :label="$t('common.voiceSynthesis.voiceCloning')">
          <div class="voice-cloning-container">
            <div class="voice-cloning-info">
              <t-alert
                theme="info"
                :title="$t('common.voiceSynthesis.cloningInfo.title')"
                class="info-alert"
              >
                <template #message>
                  <p>{{ $t('common.voiceSynthesis.cloningInfo.desc') }}</p>
                  <ul class="info-list">
                    <li><t-icon name="check-circle-filled" class="info-icon" /> {{ $t('common.voiceSynthesis.cloningInfo.tip1') }}</li>
                    <li><t-icon name="check-circle-filled" class="info-icon" /> {{ $t('common.voiceSynthesis.cloningInfo.tip2') }}</li>
                    <li><t-icon name="check-circle-filled" class="info-icon" /> {{ $t('common.voiceSynthesis.cloningInfo.tip3') }}</li>
                  </ul>
                </template>
              </t-alert>
            </div>
            
            <div class="clone-grid-layout">
              <div class="clone-setup-panel">
                <div class="clone-panel-header">
                  <t-icon name="sound" />
                  <span>{{ $t('common.voiceSynthesis.voiceSetup') }}</span>
                </div>
                
                <div class="voice-source-options">
                  <div class="section-title">
                    <t-icon name="file-icon" />
                    {{ $t('common.voiceSynthesis.audioSource') }}
                  </div>
                  
                  <t-tabs theme="normal" size="medium" class="source-tabs" defaultValue="upload">
                    <t-tab-panel value="upload" :label="$t('common.voiceSynthesis.uploadAudio')">
                      <div class="upload-section">
                        <t-upload
                          theme="custom"
                          :action="null"
                          :multiple="false"
                          :auto-upload="false"
                          @change="handleFileChange"
                          :accept="'.mp3,.wav,.m4a'"
                          :max-size="20 * 1024 * 1024"
                          v-model="audioFile"
                          class="custom-upload"
                        >
                          <template #default>
                            <div class="upload-trigger-area">
                              <div class="upload-icon-container">
                                <t-icon name="upload" />
                              </div>
                              <p>{{ $t('common.voiceSynthesis.selectFile') }}</p>
                              <span class="upload-hint">{{ $t('common.voiceSynthesis.fileFormatLimit') }}</span>
                            </div>
                          </template>
                        </t-upload>
                      </div>
                    </t-tab-panel>
                    
                    <t-tab-panel value="record" :label="$t('common.voiceSynthesis.recordAudio')">
                      <div class="recording-section">
                        <div class="recording-controls-container">
                          <div class="recording-header">
                            <t-icon name="sound" class="header-icon" />
                            <span>{{ $t('common.voiceSynthesis.recordAudio') }}</span>
                          </div>
                          
                          <div class="recording-status" v-if="isRecording">
                            <div class="recording-indicator">
                              <span></span><span></span><span></span>
                            </div>
                            <span>{{ $t('common.voiceSynthesis.recording') }}</span>
                          </div>
                          
                          <div class="recording-controls">
                            <div class="control-item" :class="{ 'disabled': isRecording }">
                              <t-button
                                theme="primary"
                                variant="base"
                                size="medium"
                                :disabled="isRecording"
                                @click="startRecording"
                                class="action-btn record-btn"
                              >
                                <template #icon><t-icon name="mic" /></template>
                              </t-button>
                              <span class="btn-text">{{ $t('common.voiceSynthesis.startRecord') }}</span>
                            </div>
                            
                            <div class="control-item" :class="{ 'disabled': !isRecording }">
                              <t-button
                                theme="danger"
                                variant="base"
                                size="medium"
                                :disabled="!isRecording"
                                @click="stopRecording"
                                class="action-btn stop-btn"
                              >
                                <template #icon><t-icon name="stop" /></template>
                              </t-button>
                              <span class="btn-text">{{ $t('common.voiceSynthesis.stopRecord') }}</span>
                            </div>
                          </div>
                          
                          <div v-if="recordedChunks.length > 0 && !isRecording" class="recording-complete">
                            <t-icon name="check-circle-filled" class="success-icon" /> {{ $t('common.message.recordingCompleteText') }}
                          </div>
                        </div>
                      </div>
                    </t-tab-panel>
                  </t-tabs>
                </div>
              
                <template v-if="audioFile && audioFile.length > 0">
                  <div class="audio-preview">
                    <div class="file-info">
                      <t-icon name="play-circle-stroke" />
                      <span class="file-name">{{ audioFile[0].name }}</span>
                    </div>
                    <audio :src="audioFileUrl" controls class="styled-audio"></audio>
                  </div>
                </template>
                
                <div class="voice-name-section">
                  <div class="section-title">
                    <t-icon name="user" />
                    {{ $t('common.voiceSynthesis.voiceName') }}
                  </div>
                  <t-input
                    v-model="voiceName"
                    :placeholder="$t('common.voiceSynthesis.voiceNamePlaceholder')"
                    size="medium"
                  />
                </div>
                
                <div class="sample-text-section">
                  <div class="section-title">
                    <t-icon name="edit-1" />
                    {{ $t('common.voiceSynthesis.sampleText') }}
                  </div>
                  <t-textarea
                    v-model="sampleText"
                    :placeholder="$t('common.voiceSynthesis.sampleTextPlaceholder')"
                    :autosize="{ minRows: 3, maxRows: 5 }"
                    :maxlength="1000"
                    class="sample-textarea"
                  />
                </div>
                
                <div class="clone-button-container">
                  <t-button
                    theme="primary"
                    size="large"
                    :loading="cloning"
                    :disabled="!canClone"
                    @click="handleClone"
                    block
                    class="start-clone-button"
                  >
                    <template #icon><t-icon name="star" /></template>
                    {{ $t('common.voiceSynthesis.startCloning') }}
                  </t-button>
                </div>
              </div>
              
              <div class="cloned-voices-panel">
                <div class="cloned-voices-header">
                  <t-icon name="user-avatar" />
                  <span>{{ $t('common.voiceSynthesis.clonedVoices') }}</span>
                  <t-tag theme="default" size="small" variant="light" class="voice-count" v-if="clonedVoices.length">
                    {{ clonedVoices.length }}
                  </t-tag>
                </div>
                
                <div v-if="clonedVoices.length > 0" class="voice-cards">
                  <div v-for="voice in clonedVoices" :key="voice.id" class="voice-card">
                    <div class="voice-card-header">
                      <t-avatar size="medium">{{ voice.name.charAt(0) }}</t-avatar>
                      <div class="voice-info">
                        <h3 class="voice-name">{{ voice.name }}</h3>
                        <div class="voice-date">{{ formatDate(voice.createdAt) }}</div>
                      </div>
                    </div>
                    
                    <div class="voice-card-body">
                      <div class="custom-audio-player">
                        <div 
                          v-show="isBase64Format(voice.sampleUrl) || (voice as any)._usePlayButton"
                          class="custom-player-container"
                        >
                          <div class="audio-player-wrapper">
                            <button
                              @click="playBase64Audio(voice.sampleUrl, voice.id)"
                              class="play-button"
                              :class="{ 'playing': isPlayingBase64 && playingAudioId === voice.id }"
                              :disabled="isPlayingBase64 && playingAudioId === voice.id"
                            >
                              <t-icon :name="isPlayingBase64 && playingAudioId === voice.id ? 'pause' : 'play'" />
                            </button>
                            
                            <div class="file-info">
                              {{ getSampleFileName(voice) }}
                            </div>
                            
                            <div class="time-display">
                              {{ formatAudioTime(currentPlayTime[voice.id] || 0) }} / {{ formatAudioTime(audioTotalTime[voice.id] || 0) }}
                            </div>
                            
                            <button class="volume-button" @click="toggleMute">
                              <t-icon :name="isMuted ? 'sound-off' : 'sound'" />
                            </button>
                            
                            <div class="more-button-wrapper">
                              <button class="more-button" @click.stop="toggleMoreDropdown(voice.id)">
                                <t-icon name="more" />
                              </button>
                              
                              <div v-if="showMoreDropdown[voice.id]" class="more-dropdown">
                                <button class="dropdown-item" @click.stop="downloadAudio(voice.sampleUrl, voice.name || 'sample-audio')">
                                  <t-icon name="download" />
                                  {{ t('common.button.download') }}
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div class="progress-container" @click="seekAudio($event, voice.id)">
                            <div 
                              class="progress-bar" 
                              :style="{ width: getProgressWidth(voice.id) }"
                            >
                              <div class="progress-handle" v-if="isPlayingBase64 && playingAudioId === voice.id"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="voice-card-actions">
                      <t-button theme="primary" variant="outline" size="small" @click="useClonedVoice(voice)">
                        <template #icon><t-icon name="play-circle" /></template>
                        {{ $t('common.voiceSynthesis.use') }}
                      </t-button>
                      <t-button theme="danger" variant="outline" size="small" @click="deleteClonedVoice(voice.id)">
                        <template #icon><t-icon name="delete" /></template>
                        {{ $t('common.voiceSynthesis.delete') }}
                      </t-button>
                    </div>
                  </div>
                </div>
                
                <div v-else class="empty-voices">
                  <t-empty 
                    :description="$t('common.message.noClonedVoicesText')" 
                    image=""
                  >
                    <template #extra>
                      <t-button theme="primary" @click="activeTab = 'cloning'">
                        {{ $t('common.voiceSynthesis.startCloning') }}
                      </t-button>
                    </template>
                  </t-empty>
                </div>
              </div>
            </div>
          </div>
        </t-tab-panel>
      </t-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { MessagePlugin } from 'tdesign-vue-next';
import VoiceSelector from '@/components/VoiceSelector.vue';
import { useVoiceStore } from '@/stores/voice';
import voiceApi from '@/api/voice/index';
import { useHomeStore } from '@/stores/home';

// 定义语言列表
const languages = [
  { code: 'zh-CN', name: '中文（简体）' },
  { code: 'yue-CN', name: '粤语（中国）' },
  { code: 'en-US', name: '英语（美国）' },
  { code: 'ja-JP', name: '日语' },
  { code: 'ko-KR', name: '韩语' },
  { code: 'es-ES', name: '西班牙语' },
  { code: 'fr-FR', name: '法语' },
  { code: 'ru-RU', name: '俄语' },
  { code: 'it-IT', name: '意大利语' },
  { code: 'pt-PT', name: '葡萄牙语' },
  { code: 'de-DE', name: '德语' },
];

// 页面状态
const activeTab = ref('tts');
const ttsText = ref('');
const selectedVoiceId = ref<number | undefined>(undefined);
const selectedVoice = ref<any>(null);
const selectedLanguage = ref('zh-CN');
const speed = ref(1);
const synthesizing = ref(false);
const audioUrl = ref('');
const audioFile = ref<any[]>([]);
const audioFileUrl = ref('');
const cloning = ref(false);
const isRecording = ref(false);
const mediaRecorder = ref<MediaRecorder | null>(null);
const recordedChunks = ref<Blob[]>([]);
const sampleText = ref('');
const clonedVoices = ref<any[]>([]);
const voiceStore = useVoiceStore();
const homeStore = useHomeStore();
const forceRender = ref(0);
const voiceName = ref('');

// 获取i18n实例和相关方法
const { t, locale, mergeLocaleMessage } = useI18n();
const i18n = useI18n();

// 设置默认示例文本
sampleText.value = t('common.voiceSynthesis.sampleText');

// 计算属性
const canSynthesize = computed(() => {
  return ttsText.value.trim().length > 0 && selectedVoiceId.value !== undefined;
});

const canClone = computed(() => {
  return (audioFile.value.length > 0 || recordedChunks.value.length > 0) && sampleText.value.trim().length > 0;
});

// 用于强制组件在语言变化时重新计算
const langDependent = computed(() => {
  // 依赖forceRender，使得组件在语言变化时重新计算
  return {
    lang: locale.value,
    forceUpdate: forceRender.value,
    voiceSetupLabel: t('common.voiceSynthesis.voiceSetup'),
    audioSourceLabel: t('common.voiceSynthesis.audioSource')
  };
});

// 格式化语速值显示两位小数
const formattedSpeed = computed(() => {
  return speed.value.toFixed(2);
});

// 用于输入框的语速值
const formattedSpeedInput = ref(speed.value.toFixed(2));

// 监听语速变化，更新输入框
watch(() => speed.value, (newSpeed) => {
  formattedSpeedInput.value = newSpeed.toFixed(2);
});

// 处理输入框变化
const handleSpeedInputChange = () => {
  const inputValue = parseFloat(formattedSpeedInput.value);
  if (!isNaN(inputValue) && inputValue >= 0.5 && inputValue <= 2) {
    speed.value = inputValue;
  } else {
    // 如果输入无效，重置为当前语速值
    formattedSpeedInput.value = speed.value.toFixed(2);
  }
};

// 创建AudioContext实例
let audioContext: AudioContext | null = null;
let audioSource: AudioBufferSourceNode | null = null;

// 缓存音频类型判断结果避免重复计算
const audioTypeCache = new Map<string, boolean>();

// 判断是否为Base64格式的音频
const isBase64Format = (url: string | undefined): boolean => {
  if (!url) return false;
  
  // 使用缓存结果避免重复计算
  if (audioTypeCache.has(url)) {
    return audioTypeCache.get(url)!;
  }
  
  // 检查是否是Base64格式的音频
  const isBase64 = url.startsWith('data:audio') || 
                   url.startsWith('data:application/octet-stream') ||
                   (url.startsWith('data:') && url.includes('audio'));
  
  // 缓存结果
  audioTypeCache.set(url, isBase64);
  return isBase64;
};

// 添加正在播放状态变量
const isPlayingBase64 = ref(false);
const playingAudioId = ref<string | null>(null);
const audioProgress = ref(0);
// 新增时间相关变量
const currentPlayTime = ref<Record<string, number>>({});
const audioTotalTime = ref<Record<string, number>>({});
const audioUpdateTimer = ref<number | null>(null);
const audioElement = ref<HTMLAudioElement | null>(null);
const isMuted = ref(false);
const showMoreDropdown = ref<Record<string, boolean>>({});

// 格式化音频时间
const formatAudioTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// 播放Base64格式的音频
const playBase64Audio = (audioBase64: string, voiceId: string) => {
  // 如果当前正在播放，且是同一个音频，则停止播放
  if (isPlayingBase64.value && playingAudioId.value === voiceId) {
    if (audioElement.value) {
      audioElement.value.pause();
      isPlayingBase64.value = false;
      playingAudioId.value = null;
      
      // 清除定时器
      if (audioUpdateTimer.value) {
        window.clearInterval(audioUpdateTimer.value);
        audioUpdateTimer.value = null;
      }
    }
    return;
  }
  
  // 如果当前有其他音频在播放，先停止
  if (isPlayingBase64.value && audioElement.value) {
    audioElement.value.pause();
    
    // 清除定时器
    if (audioUpdateTimer.value) {
      window.clearInterval(audioUpdateTimer.value);
      audioUpdateTimer.value = null;
    }
  }
  
  // 处理audio元素
  if (!audioElement.value) {
    audioElement.value = new Audio();
  }
  
  // 设置音频源
  if (audioBase64) {
    audioElement.value.src = audioBase64;
  } else {
    console.error('音频数据不可用');
    return;
  }
  
  // 播放前重置状态
  audioProgress.value = 0;
  currentPlayTime.value[voiceId] = 0;
  
  // 设置相关事件
  audioElement.value.onloadedmetadata = () => {
    if (audioElement.value) {
      audioTotalTime.value[voiceId] = audioElement.value.duration;
    }
  };
  
  audioElement.value.onended = () => {
    isPlayingBase64.value = false;
    playingAudioId.value = null;
    audioProgress.value = 0;
    currentPlayTime.value[voiceId] = 0;
    
    // 清除定时器
    if (audioUpdateTimer.value) {
      window.clearInterval(audioUpdateTimer.value);
      audioUpdateTimer.value = null;
    }
  };
  
  // 开始播放
  audioElement.value.play().then(() => {
    isPlayingBase64.value = true;
    playingAudioId.value = voiceId;
    
    // 设置定时器定期更新进度
    if (audioUpdateTimer.value) {
      window.clearInterval(audioUpdateTimer.value);
    }
    
    audioUpdateTimer.value = window.setInterval(() => {
      if (audioElement.value && !audioElement.value.paused) {
        audioProgress.value = (audioElement.value.currentTime / audioElement.value.duration) * 100;
        currentPlayTime.value[voiceId] = audioElement.value.currentTime;
      }
    }, 50);
  }).catch(error => {
    console.error('播放失败:', error);
  });
};

// 组件挂载
onMounted(async () => {
  // 设置语言
  locale.value = homeStore.homeState.language;
  
  // 初始化 AudioContext
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  } catch (e) {
    console.error('初始化AudioContext失败:', e);
  }
  
  // 获取已克隆的声音和系统声音
  await fetchClonedVoices();
  await fetchSystemVoices();
  
  // 强制重新渲染
  setTimeout(() => {
    forceRender.value++;
  }, 200);
});

// 监听语言变化
watch(() => homeStore.homeState.language, (newLang) => {
  locale.value = newLang;
  
  // 更新示例文本
  sampleText.value = t('common.voiceSynthesis.sampleText');
  
  // 强制重新渲染
  setTimeout(() => {
    forceRender.value++;
  }, 100);
});

// 方法
const handleVoiceChange = (voice: any) => {
  selectedVoice.value = voice;
};

const handleSynthesize = async () => {
  try {
    synthesizing.value = true;
    
    const audioBlob = await voiceApi.performTextToSpeech({
      text: ttsText.value,
      language: selectedLanguage.value,
      voiceId: selectedVoice.value?.id,
      speed: speed.value,
      useClonedVoice: !!selectedVoice.value?.isCloned
    });
    
    // 创建音频URL
    const url = URL.createObjectURL(audioBlob);
    audioUrl.value = url;
    
    MessagePlugin.success(t('common.message.synthSuccessText'));
  } catch (error) {
    console.error('语音合成错误:', error);
    MessagePlugin.error(error instanceof Error ? error.message : t('common.message.synthErrorText'));
  } finally {
    synthesizing.value = false;
  }
};

const handleFileChange = (files: any) => {
  if (files && files.length > 0) {
    const file = files[0].raw;
    if (file) {
      audioFileUrl.value = URL.createObjectURL(file);
    }
  }
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.value = new MediaRecorder(stream);
    recordedChunks.value = [];
    
    mediaRecorder.value.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.value.push(e.data);
      }
    };
    
    mediaRecorder.value.onstop = () => {
      const blob = new Blob(recordedChunks.value, { type: 'audio/wav' });
      audioFileUrl.value = URL.createObjectURL(blob);
      
      // 创建File对象以便上传
      const file = new File([blob], 'recording.wav', { type: 'audio/wav' });
      audioFile.value = [{ raw: file, name: 'recording.wav' }];
      
      isRecording.value = false;
      MessagePlugin.success(t('common.message.recordingCompleteText'));
    };
    
    mediaRecorder.value.start();
    isRecording.value = true;
  } catch (error) {
    console.error('录音错误:', error);
    MessagePlugin.error(t('common.message.micAccessErrorText'));
  }
};

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop();
    // 停止所有音轨
    mediaRecorder.value.stream.getTracks().forEach(track => track.stop());
  }
};

const handleClone = async () => {
  try {
    cloning.value = true;
    
    if (audioFile.value.length === 0 && recordedChunks.value.length === 0) {
      throw new Error(t('common.message.uploadOrRecordVoiceText'));
    }
    
    let fileToUse: File;
    
    if (audioFile.value.length > 0) {
      fileToUse = audioFile.value[0].raw;
    } else {
      const blob = new Blob(recordedChunks.value, { type: 'audio/wav' });
      fileToUse = new File([blob], 'recording.wav', { type: 'audio/wav' });
    }
    
    // 使用自定义名称或生成默认名称
    const customName = voiceName.value.trim() || 
                      t('common.voiceSynthesis.clonedVoice') + ' ' + new Date().toLocaleTimeString();
    
    const newVoice = await voiceApi.performVoiceClone(fileToUse, sampleText.value, customName);
    
    MessagePlugin.success(t('common.message.voiceCloneSuccessText'));
    
    // 刷新克隆语音列表
    fetchClonedVoices();
    
    // 清空文件和名称
    audioFile.value = [];
    audioFileUrl.value = '';
    recordedChunks.value = [];
    voiceName.value = '';
  } catch (error) {
    console.error('语音克隆错误:', error);
    MessagePlugin.error(error instanceof Error ? error.message : t('common.message.voiceCloneErrorText'));
  } finally {
    cloning.value = false;
  }
};

const fetchClonedVoices = () => {
  try {
    const voices = voiceApi.getClonedVoices();
    
    // 清除音频类型缓存
    audioTypeCache.clear();
    
    // 创建一个新的Map来存储已处理的音频数据
    const processedAudio = new Map<string, string>();
    
    // 处理克隆音色
    clonedVoices.value = voices.map(voice => {
      // 为缺少名称的语音添加默认名称
      if (!voice.name || voice.name.trim() === '') {
        voice.name = t('common.voiceSynthesis.clonedVoice') + ' ' + 
                     (voice.createdAt ? new Date(voice.createdAt).toLocaleTimeString() : '');
      }
      
      try {
        // 首先检查这个音色ID是否已经有缓存的音频数据
        const cachedAudioKey = `heygem_audio_${voice.id}`;
        const cachedAudio = localStorage.getItem(cachedAudioKey);
        
        // 如果存在缓存的Base64音频数据，优先使用
        if (cachedAudio && cachedAudio.startsWith('data:')) {
          voice.sampleUrl = cachedAudio;
          audioTypeCache.set(voice.sampleUrl, true);
          return voice;
        }
        
        // 处理Base64格式音频数据
        if (voice.sampleUrl && typeof voice.sampleUrl === 'string' && voice.sampleUrl.startsWith('data:')) {
          // 修正已知的Base64格式问题
          if (voice.sampleUrl.includes('\\"') || voice.sampleUrl.startsWith('"') || voice.sampleUrl.endsWith('"')) {
            voice.sampleUrl = voice.sampleUrl.replace(/\\"/g, '"').replace(/^"/, '').replace(/"$/, '');
          }
          
          // 确保Base64数据格式正确
          if (!voice.sampleUrl.includes(',')) {
            // 尝试修复不完整的Base64前缀
            voice.sampleUrl = 'data:audio/wav;base64,' + voice.sampleUrl.replace(/^data:/, '');
          }
          
          // 缓存有效的Base64数据
          try {
            localStorage.setItem(cachedAudioKey, voice.sampleUrl);
          } catch (storageError) {
            console.warn('无法缓存音频数据:', storageError);
          }
          
          // 预先缓存类型判断结果
          audioTypeCache.set(voice.sampleUrl, true);
          return voice;
        }
        
        // 处理旧的格式 - 兼容之前的数据
        if ((voice as any).sampleAudio && typeof (voice as any).sampleAudio === 'string' && !voice.sampleUrl) {
          try {
            // 可能是Base64字符串但没有前缀
            if ((voice as any).sampleAudio.match(/^[A-Za-z0-9+/=]+$/)) {
              voice.sampleUrl = 'data:audio/wav;base64,' + (voice as any).sampleAudio;
              
              // 缓存有效的Base64数据
              try {
                localStorage.setItem(cachedAudioKey, voice.sampleUrl);
              } catch (storageError) {
                console.warn('无法缓存音频数据:', storageError);
              }
              
              audioTypeCache.set(voice.sampleUrl, true);
              return voice;
            }
          } catch (e) {
            console.error('处理旧格式音频数据失败:', e);
          }
        }
        
        // 处理无效的Blob URL或缺失URL - 这里改为始终创建新的静音占位符
        console.log('创建新的音频URL:', voice.name);
        
        // 创建一个1秒的静音音频作为占位符
        const silentAudio = createSilentAudio(1);
        
        // 如果之前有Blob URL，尝试释放
        if (voice.sampleUrl && voice.sampleUrl.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(voice.sampleUrl);
          } catch (e) {
            console.log('释放旧URL失败:', e);
          }
        }
        
        // 创建新的Blob URL
        voice.sampleUrl = URL.createObjectURL(silentAudio);
        
        // 标记该音频为非Base64格式
        audioTypeCache.set(voice.sampleUrl, false);
        
        // 将该语音标记为需要使用播放按钮而非audio标签
        (voice as any)._usePlayButton = true;
      } catch (e) {
        console.error(`处理音色 "${voice.name}" 时出错:`, e);
        
        // 出错时也创建占位符
        try {
          const silentAudio = createSilentAudio(1);
          
          // 如果之前有Blob URL，尝试释放
          if (voice.sampleUrl && voice.sampleUrl.startsWith('blob:')) {
            try {
              URL.revokeObjectURL(voice.sampleUrl);
            } catch (releaseError) {
              console.log('释放旧URL失败:', releaseError);
            }
          }
          
          voice.sampleUrl = URL.createObjectURL(silentAudio);
          audioTypeCache.set(voice.sampleUrl, false);
          (voice as any)._usePlayButton = true;
        } catch (fallbackError) {
          console.error('创建占位符音频失败:', fallbackError);
        }
      }
      
      return voice;
    });
    
    // 保存处理后的数据回存储
    saveProcessedVoices(clonedVoices.value);
    
    // 打印获取到的声音
    console.log('获取到的克隆音色:', clonedVoices.value);
  } catch (error) {
    console.error('获取克隆语音错误:', error);
    MessagePlugin.error(t('common.message.voiceLoadErrorText'));
  }
};

// 保存处理后的音色数据回localStorage
const saveProcessedVoices = (voices: any[]) => {
  try {
    const processedVoices = voices.map(voice => {
      // 创建一个副本，避免修改原始对象
      const voiceCopy = { ...voice };
      
      // 如果是Base64数据，保持原样
      if (voiceCopy.sampleUrl && voiceCopy.sampleUrl.startsWith('data:')) {
        // 已经是持久化的格式，不需要处理
      } else if (voiceCopy.sampleUrl && voiceCopy.sampleUrl.startsWith('blob:')) {
        // 如果是Blob URL，从localStorage尝试恢复Base64数据
        const cachedAudioKey = `heygem_audio_${voiceCopy.id}`;
        const cachedAudio = localStorage.getItem(cachedAudioKey);
        
        if (cachedAudio && cachedAudio.startsWith('data:')) {
          voiceCopy.sampleUrl = cachedAudio;
        } else {
          // 无法恢复，删除sampleUrl避免保存无效URL
          delete voiceCopy.sampleUrl;
        }
      }
      
      // 删除内部状态标记
      delete voiceCopy._usePlayButton;
      delete voiceCopy._processingError;
      
      return voiceCopy;
    });
    
    // 保存处理后的音色列表
    localStorage.setItem('heygem_cloned_voices', JSON.stringify(processedVoices));
  } catch (error) {
    console.error('保存处理后的音色数据失败:', error);
  }
};

// 处理音频加载错误
const handleAudioError = (event: Event, voice: any) => {
  console.error('音频加载错误:', event, voice);
  
  // 防止循环刷新：使用一个标记检查此音频是否已处理过
  if ((voice as any)._processingError) return;
  
  try {
    // 标记为正在处理
    (voice as any)._processingError = true;
    
    // 检查localStorage中是否有缓存的音频数据
    const cachedAudioKey = `heygem_audio_${voice.id}`;
    const cachedAudio = localStorage.getItem(cachedAudioKey);
    
    // 如果有缓存的Base64数据，尝试使用它
    if (cachedAudio && cachedAudio.startsWith('data:')) {
      console.log('从缓存恢复Base64音频:', voice.name);
      voice.sampleUrl = cachedAudio;
      audioTypeCache.set(voice.sampleUrl, true);
      
      // 重置处理标记
      setTimeout(() => {
        (voice as any)._processingError = false;
      }, 500);
      
      // 强制重新渲染
      forceRender.value++;
      return;
    }
    
    // 检查是否有Base64数据但加载失败
    if (voice.sampleUrl && voice.sampleUrl.startsWith('data:')) {
      console.log('尝试修复Base64音频:', voice.name);
      
      // 将其转换为播放按钮模式
      audioTypeCache.set(voice.sampleUrl, true);
      (voice as any)._usePlayButton = true;
      
      // 尝试重新缓存
      try {
        localStorage.setItem(cachedAudioKey, voice.sampleUrl);
      } catch (storageError) {
        console.warn('无法缓存音频数据:', storageError);
      }
      
      // 重置处理标记
      setTimeout(() => {
        (voice as any)._processingError = false;
      }, 500);
      
      // 强制重新渲染
      forceRender.value++;
      return;
    }
    
    // 如果是Blob URL失效
    if (voice.sampleUrl && voice.sampleUrl.startsWith('blob:')) {
      console.log('Blob URL无效，创建新的URL:', voice.name);
      
      // 在创建新URL前尝试释放旧URL
      try {
        URL.revokeObjectURL(voice.sampleUrl);
      } catch (e) {
        console.log('释放旧URL失败:', e);
      }
      
      // 创建新的音频URL (使用同步方法)
      const silentAudio = createSilentAudio(1);
      voice.sampleUrl = URL.createObjectURL(silentAudio);
      
      // 标记为使用播放按钮，避免使用audio标签继续触发错误
      (voice as any)._usePlayButton = true;
      audioTypeCache.set(voice.sampleUrl, false);
      
      // 重置处理标记
      setTimeout(() => {
        (voice as any)._processingError = false;
      }, 500);
      
      // 强制重新渲染
      forceRender.value++;
    }
  } catch (e) {
    console.error('处理音频加载错误时出错:', e);
    // 重置处理标记
    setTimeout(() => {
      (voice as any)._processingError = false;
    }, 1000);
  }
};

// 组件卸载时清理资源
onUnmounted(() => {
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value = null;
  }
  
  if (audioUpdateTimer.value) {
    window.clearInterval(audioUpdateTimer.value);
    audioUpdateTimer.value = null;
  }
  
  // 释放所有音频资源
  if (audioSource) {
    try {
      audioSource.stop();
    } catch (e) {
      // 忽略已停止的错误
    }
    audioSource = null;
  }
  
  if (audioContext) {
    audioContext.close().catch(e => {
      console.error('关闭音频上下文失败', e);
    });
  }
  
  // 清理所有Blob URLs
  clonedVoices.value.forEach(voice => {
    if (voice.sampleUrl && voice.sampleUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(voice.sampleUrl);
      } catch (e) {
        console.error('释放URL失败:', e);
      }
    }
  });
});

// 创建一个静音音频Blob - 同步版本
const createSilentAudio = (durationSec: number): Blob => {
  // 使用固定数据创建静音音频文件
  // WAV 文件头 + PCM格式的静音数据
  const sampleRate = 8000;
  const numSamples = Math.floor(sampleRate * durationSec);
  
  // 创建 ArrayBuffer
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  
  // WAV文件头(44字节)
  // "RIFF"标识
  view.setUint8(0, 0x52); // R
  view.setUint8(1, 0x49); // I
  view.setUint8(2, 0x46); // F
  view.setUint8(3, 0x46); // F
  
  // 文件大小
  view.setUint32(4, 32 + numSamples * 2, true);
  
  // "WAVE"标识
  view.setUint8(8, 0x57);  // W
  view.setUint8(9, 0x41);  // A
  view.setUint8(10, 0x56); // V
  view.setUint8(11, 0x45); // E
  
  // "fmt "子块
  view.setUint8(12, 0x66); // f
  view.setUint8(13, 0x6d); // m
  view.setUint8(14, 0x74); // t
  view.setUint8(15, 0x20); // [空格]
  
  // 子块大小
  view.setUint32(16, 16, true);
  
  // 音频格式(1为PCM)
  view.setUint16(20, 1, true);
  
  // 通道数
  view.setUint16(22, 1, true);
  
  // 采样率
  view.setUint32(24, sampleRate, true);
  
  // 字节率
  view.setUint32(28, sampleRate * 2, true);
  
  // 块对齐
  view.setUint16(32, 2, true);
  
  // 位深度
  view.setUint16(34, 16, true);
  
  // "data"子块
  view.setUint8(36, 0x64); // d
  view.setUint8(37, 0x61); // a
  view.setUint8(38, 0x74); // t
  view.setUint8(39, 0x61); // a
  
  // 数据大小
  view.setUint32(40, numSamples * 2, true);
  
  // 写入静音数据(全部为0)
  for (let i = 0; i < numSamples; i++) {
    view.setInt16(44 + i * 2, 0, true);
  }
  
  // 返回Blob
  return new Blob([buffer], { type: 'audio/wav' });
};

const useClonedVoice = (voice: any) => {
  activeTab.value = 'tts';
  selectedVoice.value = {
    id: voice.voiceId,
    name: voice.name,
    isCloned: true
  };
  // 设置selectedVoiceId的值，使下拉列表自动选中克隆音色
  selectedVoiceId.value = voice.voiceId;
  
  // 通知用户
  MessagePlugin.info(t('common.message.selectedVoiceText', { name: voice.name }));
};

const deleteClonedVoice = (id: string) => {
  try {
    // 删除音频缓存
    try {
      const cachedAudioKey = `heygem_audio_${id}`;
      localStorage.removeItem(cachedAudioKey);
    } catch (e) {
      console.warn('清理音频缓存失败:', e);
    }
    
    const success = voiceApi.deleteClonedVoice(id);
    
    if (success) {
      // 从列表中移除
      clonedVoices.value = clonedVoices.value.filter(voice => voice.id !== id);
      MessagePlugin.success(t('common.message.deleteSuccessText'));
    } else {
      MessagePlugin.error(t('common.message.deleteErrorText'));
    }
  } catch (error) {
    console.error('删除克隆语音错误:', error);
    MessagePlugin.error(error instanceof Error ? error.message : t('common.message.deleteErrorText'));
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // 将zh和en转换为有效的BCP 47语言标签
  const langTag = locale.value === 'zh' ? 'zh-CN' : 'en-US';
  return date.toLocaleDateString(langTag, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const handleDownload = () => {
  if (!audioUrl.value) return;
  
  const a = document.createElement('a');
  a.href = audioUrl.value;
  a.download = `heygem_tts_${Date.now()}.mp3`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// 获取用于显示的示例文件名
const getSampleFileName = (voice: any): string => {
  return t('common.voiceSynthesis.sampleAudio');
};

// 添加函数获取系统音色
const fetchSystemVoices = async () => {
  try {
    // 获取MiniMax系统音色
    const voices = await voiceApi.getSystemVoices();
    console.log('获取到MiniMax系统音色:', voices);
  } catch (error) {
    console.error('获取MiniMax系统音色错误:', error);
    MessagePlugin.error(t('common.message.voiceLoadErrorText'));
  }
};

// 初始化i18n
const initI18n = () => {
  // 中文翻译
  const zhMessages = {
    'common.voiceSynthesis': {
      // 如果需要添加新的文本，在这里添加
      // 但不要重复定义已经在common.ts中定义的键
    }
  };
  
  // 英文翻译
  const enMessages = {
    'common.voiceSynthesis': {
      // 如果需要添加新的文本，在这里添加
      // 但不要重复定义已经在common.ts中定义的键
    }
  };

  // 合并翻译
  mergeLocaleMessage('zh', zhMessages);
  mergeLocaleMessage('en', enMessages);
  
  // 重新触发渲染
  setTimeout(() => {
    forceRender.value++;
  }, 100);
};

// 立即初始化i18n
initI18n();

// 获取进度条宽度
const getProgressWidth = (voiceId: string): string => {
  const progress = (currentPlayTime[voiceId] || 0) / (audioTotalTime[voiceId] || 1) * 100;
  return `${progress}%`;
};

// 静音/取消静音切换
const toggleMute = () => {
  if (!audioElement.value) return;
  
  audioElement.value.muted = !audioElement.value.muted;
  isMuted.value = audioElement.value.muted;
};

// 切换更多选项下拉菜单的显示状态
const toggleMoreDropdown = (voiceId: string) => {
  showMoreDropdown.value = { ...showMoreDropdown.value, [voiceId]: !showMoreDropdown.value[voiceId] };
  
  // 点击外部关闭下拉菜单
  setTimeout(() => {
    const clickHandler = (event: MouseEvent) => {
      showMoreDropdown.value = { ...showMoreDropdown.value, [voiceId]: false };
      document.removeEventListener('click', clickHandler);
    };
    document.addEventListener('click', clickHandler);
  }, 0);
};

// 下载音频
const downloadAudio = (audioUrl: string, fileName: string) => {
  if (!audioUrl) {
    MessagePlugin.error(t('common.message.noAudioToDownload'));
    return;
  }
  
  // 创建隐藏的a标签下载音频
  const a = document.createElement('a');
  a.href = audioUrl;
  a.download = `${fileName}.mp3`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // 关闭下拉菜单
  Object.keys(showMoreDropdown.value).forEach(key => {
    showMoreDropdown.value[key] = false;
  });
};

// 点击进度条跳转音频进度
const seekAudio = (event: MouseEvent, voiceId: string) => {
  if (!audioElement.value || !isPlayingBase64.value || playingAudioId.value !== voiceId) return;
  
  // 获取点击位置在进度条上的比例
  const progressContainer = event.currentTarget as HTMLElement;
  const { left, width } = progressContainer.getBoundingClientRect();
  const clickPosition = (event.clientX - left) / width;
  
  // 计算新的时间点
  const newTime = clickPosition * (audioTotalTime.value[voiceId] || 0);
  
  // 设置音频播放时间
  if (audioElement.value && !isNaN(newTime)) {
    audioElement.value.currentTime = newTime;
    currentPlayTime.value[voiceId] = newTime;
    audioProgress.value = clickPosition * 100;
  }
};
</script>

<style lang="less" scoped>
.voice-synthesis-container {
  padding: 20px;
  height: calc(100vh - 60px);
  background-color: #f4f4f6;
  overflow: auto;
  
  .header {
    margin-bottom: 20px;
    
    h1 {
      font-size: 24px;
      font-weight: 600;
      color: #0a0a0a;
    }
  }
  
  .content-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  
  .tts-container, .voice-cloning-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 16px 0;
  }
  
  .section-title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    color: #333;
    
    .t-icon {
      color: #666;
      margin-right: 6px;
    }
  }
  
  .voice-settings {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin: 16px 0;
    
    & > div {
      min-width: 200px;
      flex: 1;
    }
  }
  
  .action-buttons {
    display: flex;
    gap: 12px;
    margin-top: 16px;
  }
  
  .audio-player {
    margin-top: 20px;
    padding: 16px;
    border-radius: 8px;
    background-color: #f5f7fa;
    border: 1px solid #e7e7e7;
    
    audio {
      width: 100%;
    }
  }
  
  .voice-cloning-info {
    margin-bottom: 20px;
  }
  
  .voice-samples-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .voice-samples-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  .voice-upload-section, .recording-section {
    flex: 1;
  }
  
  .clone-form {
    padding: 16px;
    border: 1px solid #e7e7e7;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
  
  .voice-upload-section, .recording-section, .sample-text-section {
    margin-bottom: 20px;
  }
  
  .custom-upload {
    .upload-trigger-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 120px;
      border: 1px dashed #dcdcdc;
      border-radius: 8px;
      background-color: #fafafa;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        border-color: #666;
        background-color: rgba(102, 102, 102, 0.05);
      }
      
      p {
        margin-top: 8px;
        color: #666;
      }
    }
  }
  
  .audio-preview {
    margin-top: 16px;
    padding: 12px;
    border-radius: 8px;
    background-color: #fff;
    border: 1px solid #e7e7e7;
    
    audio {
      width: 100%;
    }
  }
  
  .recording-controls-container {
    background-color: #f9f9f9;
    border: 1px solid #e7e7e7;
    border-radius: 8px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 160px;
  }
  
  .recording-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    color: #333;
    font-weight: 600;
    
    .header-icon {
      margin-right: 8px;
      color: #666;
    }
  }
  
  .recording-controls {
    display: flex;
    gap: 60px;
    margin: 20px 0;
    
    .control-item {
      display: flex;
      align-items: center;
      flex-direction: column;
      gap: 8px;
      
      &.disabled {
        opacity: 0.6;
      }
      
      .action-btn {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        padding: 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        
        :deep(.t-icon) {
          font-size: 22px;
        }
      }
      
      .record-btn {
        background-color: #666;
        
        &:hover:not(:disabled) {
          background-color: #555;
        }
      }
      
      .stop-btn {
        background-color: rgba(102, 102, 102, 0.1);
        color: #666;
        
        &:hover:not(:disabled) {
          background-color: rgba(102, 102, 102, 0.2);
        }
      }
      
      .btn-text {
        font-size: 13px;
        color: #666;
        font-weight: 500;
      }
    }
  }
  
  .recording-status {
    margin-bottom: 16px;
    color: #666;
    font-weight: 500;
    font-size: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    background-color: rgba(102, 102, 102, 0.05);
    padding: 10px 16px;
    border-radius: 8px;
  }
  
  .recording-indicator {
    display: flex;
    gap: 4px;
    align-items: center;
    
    span {
      display: inline-block;
      width: 4px;
      height: 16px;
      background-color: #666;
      border-radius: 2px;
      animation: recording-wave 1.2s ease-in-out infinite;
      
      &:nth-child(1) { animation-delay: 0s; }
      &:nth-child(2) { animation-delay: 0.4s; }
      &:nth-child(3) { animation-delay: 0.8s; }
    }
  }
  
  .recording-complete {
    margin-top: 16px;
    color: #666;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    background-color: rgba(102, 102, 102, 0.05);
    padding: 10px 16px;
    border-radius: 8px;
    
    .success-icon {
      color: #666;
    }
  }
  
  .cloned-voices-section {
    margin-top: 16px;
    padding: 16px;
    border-radius: 8px;
    background-color: #fff;
    border: 1px solid #e7e7e7;
  }
  
  .voice-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    
    .voice-date {
      color: #999;
      font-size: 12px;
    }
    
    .voice-audio {
      height: 32px;
      border-radius: 16px;
    }
  }
  
  @keyframes recording-wave {
    0%, 40%, 100% { transform: scaleY(0.4); }
    20% { transform: scaleY(1); }
  }

  /* 语音克隆专用样式 */
  .voice-cloning-container {
    .info-alert {
      border-radius: 6px;
      border-left: 4px solid #666;
      
      .info-list {
        padding-left: 0;
        margin-top: 12px;
        list-style-type: none;
        
        li {
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          
          .info-icon {
            color: #666;
            margin-right: 8px;
          }
        }
      }
    }
    
    .clone-grid-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-top: 24px;
      
      @media (max-width: 992px) {
        grid-template-columns: 1fr;
      }
    }
    
    .clone-setup-panel, .cloned-voices-panel {
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border: 1px solid #ebedf1;
      overflow: hidden;
    }
    
    .clone-panel-header, .cloned-voices-header {
      background: #f5f5f5;
      color: #333;
      padding: 14px 20px;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #eaeaea;
      
      .t-icon {
        margin-right: 8px;
        font-size: 18px;
        color: #666;
      }
      
      .voice-count {
        margin-left: 10px;
        padding: 2px 8px;
      }
    }
    
    .voice-source-options, .sample-text-section, .clone-button-container, .audio-preview {
      padding: 16px 20px;
    }
    
    .source-tabs {
      margin-top: 10px;
      
      :deep(.t-tabs__nav) {
        padding-left: 0;
      }
      
      :deep(.t-tabs__nav-item) {
        min-width: 90px;
        text-align: center;
      }
    }
    
    .upload-section, .recording-section {
      padding-top: 12px;
    }
    
    .upload-trigger-area {
      height: 130px;
      border: 2px dashed #dcdcdc;
      border-radius: 8px;
      
      .upload-icon-container {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
        
        .t-icon {
          font-size: 26px;
          color: #666;
        }
      }
      
      p {
        font-weight: 500;
        margin: 4px 0;
      }
      
      .upload-hint {
        font-size: 12px;
        color: #999;
      }
    }
    
    .recording-controls-container {
      background-color: #f9fafc;
      border: 1px solid #e7e7e7;
      border-radius: 10px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 130px;
    }
    
    .recording-controls {
      margin: 0;
      
      .t-button {
        &:first-child {
          background-color: rgba(227, 77, 89, 0.1);
          color: #e34d59;
          width: 56px;
          height: 56px;
          
          &:hover:not(:disabled) {
            background-color: rgba(227, 77, 89, 0.2);
          }
        }
        
        &:last-child {
          background-color: rgba(0, 0, 0, 0.05);
          color: #666;
          width: 56px;
          height: 56px;
          
          &:hover:not(:disabled) {
            background-color: rgba(0, 0, 0, 0.1);
          }
        }
      }
    }
    
    .audio-preview {
      background-color: #f5f7fa;
      border-radius: 8px;
      margin: 0 20px;
      
      .file-info {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        
        .t-icon {
          color: #666;
        }
        
        .file-name {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
    
    .sample-textarea {
      border-radius: 6px;
      resize: none;
      
      &:focus, &:hover {
        border-color: #666;
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
      }
    }
    
    .start-clone-button {
      background-color: #0052d9;
      border: none;
      height: 44px;
      transition: all 0.3s;
      
      &:hover:not(:disabled) {
        background-color: #003db3;
      }
      
      &:disabled {
        background-color: rgba(0, 82, 217, 0.4);
        color: rgba(255, 255, 255, 0.7);
        cursor: not-allowed;
      }
    }
    
    .voice-cards {
      padding: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
      max-height: 500px;
      overflow-y: auto;
    }
    
    .voice-card {
      background-color: #fff;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #ebedf1;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .voice-card-header {
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        border-bottom: 1px solid #f0f0f0;
        
        .voice-info {
          flex: 1;
          overflow: hidden;
        }
        
        .voice-name {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .voice-date {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }
      }
      
      .voice-card-body {
        padding: 16px;
        background-color: #f9fafc;
      }
      
      .voice-card-actions {
        display: flex;
        padding: 12px 16px;
        gap: 8px;
        
        .t-button {
          flex: 1;
        }
        
        :deep(.t-button[theme="primary"]) {
          color: #666;
          border-color: #666;
          
          &:hover {
            color: #555;
            border-color: #555;
            background-color: rgba(102, 102, 102, 0.05);
          }
        }
        
        :deep(.t-button[theme="danger"]) {
          color: #666;
          border-color: #666;
          
          &:hover {
            color: #555;
            border-color: #555;
            background-color: rgba(102, 102, 102, 0.05);
          }
        }
      }
    }
    
    .empty-voices {
      padding: 40px 20px;
      text-align: center;
      height: 300px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      
      :deep(.t-empty) {
        padding: 32px;
        
        .t-empty__image {
          display: none;
        }
        
        .t-empty__description {
          font-size: 16px;
          color: #999;
          margin-bottom: 24px;
        }
        
        .t-button {
          min-width: 120px;
        }
      }
    }
    
    .styled-audio {
      width: 100%;
      height: 36px;
      border-radius: 18px;
    }
  }

  .speed-control-row {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .speed-slider {
      flex: 1;
      
      :deep(.t-slider__bar-active) {
        background-color: #666;
      }
      
      :deep(.t-slider__button) {
        border-color: #666;
      }
    }
    
    .speed-input-wrapper {
      position: relative;
      width: 100px;
      display: flex;
      align-items: center;
      
      .speed-input {
        width: 100%;
      }
      
      .speed-unit {
        position: absolute;
        right: 10px;
        color: #888;
        font-size: 14px;
        pointer-events: none;
      }
    }
  }

  .voice-name-section,
  .sample-text-section {
    margin-bottom: 16px;
  }
  
  .sample-textarea {
    border-radius: 6px;
    resize: none;
    
    &:focus, &:hover {
      border-color: #666;
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
    }
  }

  .more-button-wrapper {
    position: relative;
  }
  
  .more-dropdown {
    position: absolute;
    right: 0;
    top: 30px;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    z-index: 10;
    min-width: 120px;
  }
  
  .dropdown-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    width: 100%;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    color: #333;
    font-size: 14px;
    
    .t-icon {
      margin-right: 8px;
      font-size: 16px;
    }
    
    &:hover {
      background-color: #f5f5f5;
    }
  }
}

.debug-info, .debug-button {
  display: none;
}

/* 全局按钮样式覆盖 - 调整主题为primary按钮的禁用样式 */
:deep(.t-button[theme="primary"]:not(.t-button--variant-text)) {
  &.t-button--variant-base {
    background-color: #666;
    
    &:hover:not(:disabled) {
      background-color: #555;
    }
    
    &:disabled {
      background-color: rgba(102, 102, 102, 0.4);
      color: rgba(255, 255, 255, 0.7);
    }
  }
  
  // 克隆按钮的样式例外（需要蓝色禁用状态）
  &.start-clone-button:disabled {
    background-color: rgba(0, 82, 217, 0.4);
    color: rgba(255, 255, 255, 0.7);
  }
  
  &.t-button--variant-outline {
    color: #666;
    border-color: #666;
    
    &:hover:not(:disabled) {
      color: #555;
      border-color: #555;
      background-color: rgba(102, 102, 102, 0.05);
    }
  }
}

:deep(.t-button[theme="danger"]:not(.t-button--variant-text)) {
  &.t-button--variant-outline {
    color: #666;
    border-color: #666;
    
    &:hover:not(:disabled) {
      color: #555;
      border-color: #555;
      background-color: rgba(102, 102, 102, 0.05);
    }
  }
  
  &.t-button--variant-base {
    background-color: rgba(102, 102, 102, 0.1);
    color: #666;
    
    &:hover:not(:disabled) {
      background-color: rgba(102, 102, 102, 0.2);
      color: #555;
    }
  }
}

:deep(.t-button[theme="default"]:not(.t-button--variant-text)) {
  &.t-button--variant-base {
    color: #666;
    border-color: #dcdcdc;
    
    &:hover:not(:disabled) {
      color: #555;
      border-color: #c0c0c0;
      background-color: rgba(102, 102, 102, 0.05);
    }
  }
  
  &.t-button--variant-outline {
    color: #666;
    border-color: #dcdcdc;
    
    &:hover:not(:disabled) {
      color: #555;
      border-color: #c0c0c0;
      background-color: rgba(102, 102, 102, 0.05);
    }
  }
}

.custom-audio-player {
  position: relative;
  width: 100%;
  min-height: 36px;
  
  .custom-player-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: #f8f8f8;
    overflow: hidden;
    border: none;
  }
  
  .audio-player-wrapper {
    display: flex;
    align-items: center;
    padding: 0 16px;
    height: 40px;
    box-sizing: border-box;
    background-color: #f9f9f9;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
  
  .play-button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    border-radius: 0;
    background: none;
    border: none;
    cursor: pointer;
    color: #000;
    padding: 0;
    margin-right: 8px;
    
    &:hover {
      opacity: 0.8;
    }
    
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .t-icon {
      font-size: 24px;
    }
  }
  
  .file-info {
    min-width: 220px;
    margin-right: 8px;
    font-size: 13px;
    color: #000;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .time-display {
    flex: 1;
    font-size: 13px;
    color: #000;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    white-space: nowrap;
    text-align: center;
  }
  
  .volume-button,
  .more-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-left: 8px;
    
    .t-icon {
      font-size: 18px;
      color: #999;
    }
    
    &:hover {
      .t-icon {
        color: #666;
      }
    }
  }
  
  .progress-container {
    width: 100%;
    height: 3px;
    background-color: #e6e6e6;
    position: relative;
    cursor: pointer;
  }
  
  .progress-bar {
    height: 100%;
    background-color: #0052d9;
    position: absolute;
    left: 0;
    top: 0;
    transition: width 0.1s linear;
  }
  
  .progress-handle {
    position: absolute;
    right: -4px;
    top: -3px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #0052d9;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  }
}

.voice-list-container {
  .voice-item {
    // ... existing code ...
    
    // 自定义音频播放器
    .custom-player-container {
      margin-top: 8px;
      border: 1px solid #e6e6e6;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .audio-player-wrapper {
      display: flex;
      align-items: center;
      padding: 0 16px;
      height: 40px;
      box-sizing: border-box;
      background-color: #f7f7f7;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
    
    // ... existing code ...
    
    .progress-container {
      width: 100%;
      height: 3px;
      background-color: #e6e6e6;
      position: relative;
      cursor: pointer;
      
      &:hover {
        height: 5px;
        transition: height 0.2s ease;
        
        .progress-bar {
          height: 100%;
        }
        
        .progress-handle {
          top: -4px;
          width: 10px;
          height: 10px;
        }
      }
    }
    
    .progress-bar {
      height: 100%;
      background-color: #0052d9;
      position: absolute;
      left: 0;
      top: 0;
      transition: width 0.1s linear;
    }
    
    .progress-handle {
      position: absolute;
      right: -5px;
      top: -4px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #0052d9;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
      transition: all 0.2s ease;
    }
    // ... existing code ...
  }
}
</style> 


