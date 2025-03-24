<template>
  <div class="header">
    <div class="header-left" @click="action.back">
      <ChevronLeftIcon class="icon" /> {{ $t('common.headerView.headerBackText') }}
    </div>
    <div class="header-center">
      <t-input
        class="input"
        autofocus
        v-model="video.name"
        borderless
        v-if="state.isEditingName"
        @blur="action.toggleEditingName(false)"
        @enter="action.toggleEditingName(false)"
      >
      </t-input>
      <div class="name" v-else>{{ video.name }}</div>
      <Edit2Icon class="icon" @click="action.toggleEditingName(true)" />
    </div>
    <div class="header-right">
      <!-- <t-button @click="action.toSaveVideo" :loading="state.saveLoading">
        <template #icon>
          <SaveIcon />
        </template>
保存
</t-button> -->
      <t-button @click="action.toCreateVideo" :loading="state.createLoading">
        {{ $t('common.headerView.createVideoBtnText') }}
      </t-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, PropType } from 'vue'
import { ChevronLeftIcon, SaveIcon, Edit2Icon } from 'tdesign-icons-vue-next'
import { useRouter } from 'vue-router'

// 定义视频信息接口
interface VideoInfo {
  id?: string | number
  name: string
  [key: string]: any
}

// 定义组件状态接口
interface ComponentState {
  createLoading: boolean
  saveLoading: boolean
  isEditingName: boolean
}

const props = defineProps({
  onSubmit: {
    type: Function as PropType<() => Promise<void>>,
    default: async () => {}
  },
  onSave: {
    type: Function as PropType<() => Promise<string>>,
    default: async () => ''
  }
})

const video = defineModel<VideoInfo>({})

const router = useRouter()

const state = reactive<ComponentState>({
  createLoading: false,
  saveLoading: false,
  isEditingName: false
})

const action = {
  back(): void {
    router.back()
  },
  toggleEditingName(isEditingName: boolean): void {
    state.isEditingName = isEditingName
  },
  async toSaveVideo(): Promise<void> {
    state.saveLoading = true
    await props.onSave()
    state.saveLoading = false
  },
  async toCreateVideo(): Promise<void> {
    state.createLoading = true
    await props.onSubmit()
    state.createLoading = false
  }
}
</script>
<style lang="less" scoped>
.header {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px 0 23px;
  -webkit-app-region: drag;

  &-left {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #ffffff;
    gap: 6px;
    cursor: pointer;
    padding-right: 20px;
    border-right: 1px solid rgba(255, 255, 255, 0.25);
    -webkit-app-region: no-drag;

    .icon {
      font-size: 20px;
    }
  }

  &-center {
    flex: 1;
    padding: 0 30px;
    display: flex;
    align-items: center;
    gap: 4px;

    .input {
      width: 300px;
      --td-bg-color-specialcomponent: #1d1e20;
      --td-text-color-primary: #ffffff;
      --td-text-color-placeholder: rgba(255, 255, 255, 0.6);
      --td-bg-color-container-hover: transparent;
      -webkit-app-region: no-drag;

      :deep(.t-input) {
        border-color: rgba(255, 255, 255, 0.6);
      }

      :deep(.t-input--focused) {
        box-shadow: none;
      }
    }

    .name {
      font-weight: 600;
      font-size: 14px;
      color: #ffffff;
      line-height: 16px;
      -webkit-app-region: no-drag;
    }

    .icon {
      color: #888899;
      cursor: pointer;
      font-size: 16px;
      -webkit-app-region: no-drag;
    }
  }

  &-right {
    display: flex;
    align-items: center;
    gap: 16px;
    -webkit-app-region: no-drag;
  }
}
</style>
