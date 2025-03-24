<template>
  <div class="edit">
    <div class="edit-header">{{ $t('common.editView.headerText') }}</div>
    <t-radio-group class="edit-tabs" variant="default-filled" size="large" v-model="state.activeTab"
      @change="action.onChangeTab">
      <t-radio-button :value="EDIT_TABS.TEXT">文本合成</t-radio-button>
      <t-radio-button :value="EDIT_TABS.AUDIO">音频合成</t-radio-button>
    </t-radio-group>
    <div class="edit-body edit-body-text" v-show="getter.isTextTab.value">
      <EditText v-model="select" class="content" :listener="listener" />
    </div>
    <div class="edit-body" v-show="getter.isAudioTab.value">
      <EditUpload v-model="select" class="content" :listener="listener" />
    </div>
    <EditListener ref="listener" />
  </div>
</template>
<script setup lang="ts">
import { computed, reactive, ref, ComputedRef } from 'vue'
import EditListener from './EditListener.vue'
import EditUpload from './EditUpload.vue';
import EditText from './EditText.vue';

// 定义选择状态接口
interface SelectState {
  model: {
    id?: string | number
    name?: string
    [key: string]: any
  }
  speaker?: {
    id?: string
    name?: string
    [key: string]: any
  }
  text?: string
  uploaded?: {
    audioUrl?: string
    duration?: number
    [key: string]: any
  } | null
  [key: string]: any
}

// 定义组件状态接口
interface ComponentState {
  activeTab: string
  textToAudioLoading: boolean
}

// 定义计算属性
interface Getters {
  isTextTab: ComputedRef<boolean>
  isAudioTab: ComputedRef<boolean>
}

const select = defineModel<SelectState>({})

const EDIT_TABS = {
  TEXT: '1',
  AUDIO: '2'
}

const state = reactive<ComponentState>({
  activeTab: EDIT_TABS.TEXT,
  textToAudioLoading: false,
})

const listener = ref<InstanceType<typeof EditListener> | null>(null)

const getter: Getters = {
  isTextTab: computed(() => {
    return state.activeTab === EDIT_TABS.TEXT
  }),
  isAudioTab: computed(() => {
    return state.activeTab === EDIT_TABS.AUDIO
  })
}

const action = {
  onChangeTab(): void {
    listener.value?.pause()
  }
}
</script>
<style lang="less" scoped>
.edit {
  display: flex;
  height: 100%;
  flex-direction: column;

  &-header {
    font-weight: 500;
    padding: 18px;
    font-size: 14px;
    color: #ffffff;
    line-height: 22px;
    text-align: center;
    border-bottom: 1px solid #000000;
  }

  &-tabs {
    margin: 12px 20px 0;
    display: flex;
    width: auto;
    padding: 6px;
    border-radius: 4px;
    background-color: #161718;
    --td-bg-color-container-select: #2B3B52;

    :deep(.t-radio-button) {
      width: 50%;
      border-radius: 4px;
    }

    :deep(.t-radio-button__label) {
      margin: auto;
      font-weight: 400;
      font-size: 14px;
      color: #FFFFFF;
      line-height: 20px;
    }

    :deep(.t-is-checked .t-radio-button__label) {
      // font-weight: bold;
      font-weight: 400;
    }
  }

  &-body {
    flex: 1;
    width: 100%;
    height: 100%;
    padding: 12px 20px;
    display: flex;
    justify-content: center;
    align-items: start;
    position: relative;

    .content {
      border-radius: 8px 8px 8px 8px;
      width: 100%;
      --td-bg-color-specialcomponent: #161718;
      --td-brand-color-focus: #161718;
    }

    &-text {
      padding-bottom: 91px;

      .content {
        background-color: #161718;
      }
    }
  }
}
</style>
