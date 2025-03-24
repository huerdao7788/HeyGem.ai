<template>
  <t-layout class="layout">
    <t-header class="layout-header">
      <Header :on-submit="action.submit" :on-save="action.save" v-model="state.video" />
    </t-header>
    <t-layout class="layout-body">
      <!-- <t-aside width="50px">Aside</t-aside> -->
      <t-content class="layout-content">
        <t-row class="content-row">
          <t-col :flex="2.7">
            <Select class="content-left" v-model="state.select" @query="action.queryModelList" />
          </t-col>
          <t-col :flex="4.5">
            <Preview class="content-center" :model="state.select.model" />
          </t-col>
          <t-col :flex="5.0">
            <Edit class="content-right" v-model="state.select" />
          </t-col>
        </t-row>
      </t-content>
    </t-layout>
  </t-layout>
  <ModalFinished
    ref="modalFinished"
    :right-btn-text="$t('common.selectView.modalFinishedObj.rightBtnText')"
  >
    {{ $t('common.selectView.modalFinishedObj.text1')
    }}<span style="color: #434af9"> {{ $t('common.selectView.modalFinishedObj.text2') }}</span>
    {{ $t('common.selectView.modalFinishedObj.text3') }}
  </ModalFinished>
</template>
<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import Header from './header/HeaderView.vue'
import Select from './select/SelectView.vue'
import Preview from './preview/PreviewView.vue'
import Edit from './edit/EditView.vue'
import ModalFinished from '@renderer/components/ModalFinished.vue'
import { findModel, findVideo, makeVideo, modelPage, saveVideo } from '@renderer/api'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { useI18n } from 'vue-i18n'

// 定义模型接口
interface ModelInfo {
  id?: string | number
  name?: string
  videoPath?: string
  voiceId?: string
  audioPath?: string
  [key: string]: any
}

// 定义音色接口
interface SpeakerInfo {
  id?: string
  name?: string
  audioPath?: string
  [key: string]: any
}

// 定义上传的音频
interface UploadedAudio {
  name?: string
  audioUrl?: string
  duration?: number
  [key: string]: any
}

// 定义视频属性
interface VideoInfo {
  id: string | number
  name: string
  [key: string]: any
}

// 定义选择状态
interface SelectState {
  model: ModelInfo
  speaker: SpeakerInfo
  text: string
  modelList: ModelInfo[]
  uploaded: UploadedAudio | null
  [key: string]: any
}

// 定义组件状态
interface ComponentState {
  initLoading: boolean
  video: VideoInfo
  select: SelectState
}

// 定义响应接口
interface ModelPageResponse {
  list?: ModelInfo[]
  total?: number
}

const { t } = useI18n()

const route = useRoute()
const router = useRouter()

const modalFinished = ref<InstanceType<typeof ModalFinished> | null>(null)

const state = reactive<ComponentState>({
  initLoading: false,
  video: {
    id: '',
    name: `${t('common.modelCreateView.videoName')}${new Date().toLocaleString().replace(/\/|:| /g, '')}`
  },
  select: {
    model: {},
    speaker: {},
    text: '',
    modelList: [],
    uploaded: null
  }
})

const action = {
  async init(): Promise<void> {
    state.initLoading = true
    try {
      const { videoId, modelId } = route.query
      action.initWatchs()

      // 初始化视频详情
      if (videoId) {
        await action.initVideoDetail(videoId as string)
      }

      // 初始化模特列表
      await action.queryModelList()

      // 初始化模特详情
      if (modelId) {
        state.select.model.id = modelId as string
      }

      if (!state.select.model.id) {
        // 如果未选中模特，则默认选中第一个模特
        state.select.model.id = state.select.modelList[0]?.id
      }

      if (state.select.model.id) {
        await action.initModelDetail(state.select.model.id)
      }

      // 选中的模特滚动到中间
      setTimeout(action.scrollToSelectModel)
    } catch (error) {
      console.error('初始化视频编辑页面失败', error)
      const { videoId, modelId } = route.query
      if (videoId || modelId) {
        MessagePlugin.error(t('common.message.initEditVideoPageFailed'))
      }
    } finally {
      state.initLoading = false
    }
  },

  //变更模特时，音色跟随变更
  initWatchs(): void {
    watch(
      () => state.select.model,
      async (model: ModelInfo) => {
        if (model?.voiceId) {
          state.select.speaker = {
            id: model.voiceId,
            name: model.name,
            audioPath: model.audioPath
          }
        }
      }
    )
  },
  async queryModelList(name: string = ''): Promise<void> {
    try {
      const result = (await modelPage({
        name,
        page: 1,
        pageSize: 100
      })) as ModelPageResponse

      state.select.modelList = result.list || []
    } catch (error) {
      console.error('查询模特列表失败', error)
      state.select.modelList = []
    }
  },
  // 选中的模特滚动到中间
  scrollToSelectModel(): void {
    const target = document.querySelector(`div[model-id="${state.select.model.id}"]`)
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  },
  async initVideoDetail(videoId: string): Promise<void> {
    const videoDetail = await findVideo(videoId)
    if (videoDetail) {
      state.video.id = videoDetail.id
      state.video.name = videoDetail.name
      state.select.text = videoDetail.textContent
      state.select.model.id = videoDetail.modelId
    }
  },
  async initModelDetail(modelId: string | number): Promise<void> {
    state.select.model = await findModel(modelId)
  },
  check(): boolean {
    const { select, video } = state
    if (!select.model.id) {
      MessagePlugin.error(t('common.message.selectModelsTextError'))
      return false
    }
    if (!video.name) {
      MessagePlugin.error(t('common.message.VideoTextError'))
      return false
    }
    if (!select.text && !select.uploaded?.audioUrl) {
      MessagePlugin.error(t('common.message.VideoCopywritingTextError'))
      return false
    }
    return true
  },
  async submit(): Promise<void> {
    if (state.initLoading || !action.check()) return
    try {
      state.video.id = await action.save()
      const isOK = await action.make(state.video.id)
      if (isOK) {
        const isToSee = await modalFinished.value?.show()
        isToSee ? router.push('/home') : window.location.reload()
      } else {
        throw new Error('合成视频失败')
      }
    } catch (error) {
      console.error(error)
      MessagePlugin.error(t('common.message.videoSynthesisTextError'))
    }
  },
  async save(): Promise<string> {
    if (state.initLoading) return ''
    // modelId, name, text_content
    const { select, video } = state

    const sumitAudio: Record<string, any> = {}
    if (select.uploaded?.audioUrl && !select.text) {
      sumitAudio.audioPath = select.uploaded.audioUrl
      sumitAudio.audioName = select.uploaded.name
    } else {
      sumitAudio.voiceId = select.speaker.id
    }

    const saveId = await saveVideo({
      modelId: select.model.id,
      name: video.name,
      textContent: select.text,
      ...sumitAudio
    })
    return (video.id || saveId).toString()
  },
  async make(videoId: string): Promise<boolean> {
    const makeId = await makeVideo(videoId)
    return makeId === videoId
  }
}

action.init()
</script>
<style lang="less" scoped>
.layout {
  width: 100%;
  height: 100vh;
  --td-bg-color-container: #1d1e20;
  --td-bg-color-page: #1d1e20;
  color: #ffffff;

  :deep(.t-loading__text) {
    color: #ffffff;
  }

  :deep(.t-loading__gradient-conic) {
    background: conic-gradient(
      from 90deg at 50% 50%,
      rgba(67, 74, 249, 0) 0deg,
      rgb(255, 255, 255) 360deg
    ) !important;
  }

  &-header {
    height: 60px;
    flex: none;
    border-bottom: 1px solid #000000;
  }

  &-body {
    height: calc(100vh - 60px);
    overflow: hidden;
  }

  &-content {
    height: 100%;
  }

  .content-row {
    height: 100%;
    align-items: unset;

    & > * {
      height: 100%;
    }

    .content-left {
      height: 100%;
    }

    .content-center {
      height: 100%;
    }

    .content-right {
      height: 100%;
    }
  }
}
</style>
