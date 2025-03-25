<template>
  <div class="upload">
    <div class="upload-uploaded" v-if="select.uploaded">
      <div class="info">
        <div class="tag">上传</div>
        <div class="name">{{ select.uploaded.name }}</div>
      </div>
      <div class="control">
        <div class="duration">{{ select.uploaded.duration }}</div>
        <t-button class="start" size="small" @click="action.listen"
          >试听</t-button
        >
        <t-button class="save" size="small" @click="action.save" :loading="state.audioLoading">上传</t-button>
        <img
          class="delete"
          src="@renderer/assets/images/icons/icon-del.png"
          @click="action.deleteAudio"
          title="删除"
          alt=""
        />
      </div>
    </div>
    <div class="upload-box" v-else>
      <t-button class="btn" theme="default" @click="action.uploadAudio" :loading="state.uploading">
        <template #icon>
          <AddIcon />
        </template>
        添加音频
      </t-button>
      <div class="tip">
        <img class="icon" src="@renderer/assets/images/icons/icon-alert.png" alt="" />
        <span
          >单次最多上传1个录音文件；支持mp3、wav、flac、m4a文件，单个录音时长小于30分钟，请上传纯干音文件，背景音、噪音会影响视频合成效果哦～</span
        >
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, PropType } from 'vue'
import { AddIcon } from 'tdesign-icons-vue-next'
import { millisecondsToTime } from '@renderer/utils'
import { MessagePlugin } from 'tdesign-vue-next'
import { Client } from '@renderer/client'
import { voiceSave } from '@renderer/api'

// 定义上传的音频信息接口
interface UploadedAudio {
  name?: string
  audioUrl?: string
  duration?: string | number
  fileObj?: File
  [key: string]: any
}

// 定义音频检查结果接口
interface AudioCheckResult {
  isOK: boolean
  msg?: string
  duration?: number
  [key: string]: any
}

// 定义选择状态接口
interface SelectState {
  model?: {
    id?: string| number
    name?: string
    [key: string]: any
  }
  speaker?: {
    id?: string| number
    name?: string
    [key: string]: any
  }
  text?: string
  uploaded?: UploadedAudio | null
  [key: string]: any
}

// 定义组件状态接口
interface ComponentState {
  uploading: boolean
  audioLoading: boolean
}

// 定义监听器接口
interface Listener {
  listen: (data: UploadedAudio) => void
  close: () => void
  current: () => { audioUrl: string, [key: string]: any }
  [key: string]: any
}

const props = defineProps({
  listener: {
    type: Object as PropType<Listener>,
    default: () => ({})
  }
})

const state = reactive<ComponentState>({
  uploading: false,
  audioLoading: false
})

const select = defineModel<SelectState>({})

const action = {
  async uploadAudio(): Promise<void> {
    const fileObj = await Client.file.selectAudio()
    if (fileObj) {
      state.uploading = true
      try {
        const fileName = fileObj.name
        const audioUrl = URL.createObjectURL(fileObj)

        select.value.uploaded = {
          name: fileName,
          audioUrl: audioUrl,
        }

        const audio = new Audio(audioUrl)
        audio.addEventListener('loadedmetadata', () => {
          if (select.value.uploaded) {
            select.value.uploaded.duration = millisecondsToTime(audio.duration * 1000)
          }
        })
      } catch (err) {
        console.error(err)
      } finally {
        state.uploading = false
      }
    }
  },
  check(audioInfo: AudioCheckResult): boolean {
    if (!audioInfo.isOK) {
      MessagePlugin.error(audioInfo.msg || '音频上传失败')
      return false
    }
    if (audioInfo.duration && audioInfo.duration > 60 * 30) {
      MessagePlugin.error('音频时长不能超过30分钟')
      return false
    }
    return true
  },
  deleteAudio(): void {
    const { audioUrl } = props.listener.current()
    if (audioUrl === select.value.uploaded?.audioUrl) {
      props.listener.close()
    }
    select.value.uploaded = null
  },
  listen(): void {
    if (!select.value.uploaded) return
    const { name, audioUrl, duration } = select.value.uploaded

    props.listener.listen({ name, audioUrl, duration })
  },
  async save(): Promise<void> {
    if (!select.value.uploaded) return

    state.audioLoading = true
    try {
      if (select.value.uploaded?.audioUrl) {
        await voiceSave(select.value.uploaded.audioUrl,select.value.uploaded.name,"true","")
      }
    } finally {
      state.audioLoading = false
    }
  }
}
</script>
<style lang="less" scoped>
.upload {
  &-box {
    display: flex;
    align-items: center;
    gap: 16px;
    --td-bg-color-secondarycontainer: transparent;
    --td-bg-color-specialcomponent: #1d1e20;
    --td-text-color-primary: #ffffff;
    --td-text-color-placeholder: rgba(255, 255, 255, 0.6);

    .btn {
      flex: none;
      height: 28px;
      background: #3d4045;
      border-radius: 4px 4px 4px 4px;
      border: none;
      font-weight: 500;
      font-size: 12px;
      padding: 0 10px;
    }

    .tip {
      flex: 1;
      padding: 4px 8px;
      background: rgba(255, 147, 47, 0.12);
      border-radius: 4px 4px 4px 4px;
      font-weight: 400;
      font-size: 10px;
      color: #ff932f;
      line-height: 16px;
      display: flex;
      align-items: center;

      .icon {
        width: 12px;
        height: 12px;
        margin-right: 8px;
      }
    }
  }

  &-uploaded {
    color: #ffffff;
    padding: 12px;
    width: 100%;
    height: 90px;
    background: #191a1b;
    border-radius: 4px 4px 4px 4px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .info {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 400;
      font-size: 12px;
      color: #ffffff;
      line-height: 20px;

      .tag {
        width: 32px;
        height: 16px;
        background: rgba(48, 156, 255, 0.1);
        border-radius: 2px 2px 2px 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #309cff;
      }
    }

    .control {
      display: flex;
      align-items: center;
      gap: 12px;

      .duration {
        margin-left: 6px;
        font-weight: 400;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.3);
        line-height: 14px;
      }

      .save {
        min-width: 48px;
        height: 22px;
        border-radius: 3px;
        font-size: 12px;
      }

      .start {
        margin-left: auto;
        width: 44px;
        height: 22px;
        border-radius: 3px;
        font-size: 12px;
      }

      .delete {
        width: 14px;
        height: 14px;
        cursor: pointer;
      }
    }
  }
}
</style>
