<template>
  <div class="menu-list">
    <li v-for="(item, index) in state.menuList" :key="index" @click="handleClick(item)">
      <div class="content-body">
        <img class="icon" :src="item.active ? item.onIcon : item.offIcon" />
        <div class="text" :style="item.active ? 'color: #434AF9' : ''">
          {{ item.name }}
        </div>
        <img class="active-icon" v-if="item.active" :src="activeIcon" />
      </div>
    </li>
  </div>
</template>
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { reactive, watch, computed } from 'vue'
import onIcon from '../assets/images/home/menu/onHome.svg'
import activeIcon from '../assets/images/home/menu/active.svg'
import offIcon from '../assets/images/home/menu/offHome.svg'
import onVoiceIcon from '../assets/images/home/menu/onVoice.svg'
import offVoiceIcon from '../assets/images/home/menu/offVoice.svg'
import onVoiceSynthIcon from '../assets/images/home/menu/onVoiceSynth.svg'
import offVoiceSynthIcon from '../assets/images/home/menu/offVoiceSynth.svg'
import { useI18n } from 'vue-i18n'

// 定义菜单项接口
interface MenuItem {
  key: string
  name: string
  onIcon: string
  offIcon: string
  active: boolean
  path: string
}

// 定义组件状态接口
interface MenuState {
  menuList: MenuItem[]
}

const { t, locale } = useI18n()
const unRoute = useRoute()
const router = useRouter()

const obj: MenuItem[] = [
  {
    key: 'common.menu.text',
    name: t('common.menu.text'),
    onIcon,
    offIcon,
    active: true,
    path: '/home'
  },
  {
    key: 'common.menu.voice',
    name: t('common.menu.voice') || '音色管理',
    onIcon: onVoiceIcon,
    offIcon: offVoiceIcon,
    active: false,
    path: '/voice/management'
  },
  {
    key: 'common.menu.voiceSynth',
    name: t('common.menu.voiceSynth') || '语音合成',
    onIcon: onVoiceSynthIcon,
    offIcon: offVoiceSynthIcon,
    active: false,
    path: '/voice/synthesis'
  }
  /* {
      name: "账号",
      onIcon,
      offIcon,
      active: true,
      path: "/account",
    }, */
]

const state = reactive<MenuState>({
  menuList: obj
})

watch(locale, () => {
  state.menuList.forEach((el) => {
    el.name = t(el.key)
  })
})

watch(
  () => unRoute.path,
  (newPath: string) => {
    state.menuList.forEach((el) => {
      if (newPath.includes(el.path)) {
        el.active = true
      } else {
        el.active = false
      }
    })
  }
)

const handleClick = (item: MenuItem): void => {
  router.push(item.path)
}
</script>
<style lang="less" scoped>
.menu-list {
  width: 76px;
  background: #fff;
  position: fixed;
  left: 0;
  top: 0;
  padding-top: 60px;
  height: 100%;
  li {
    list-style: none;
    display: flex;
    height: 50px;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    .content-body {
      position: relative;
      .icon {
        width: 44px;
        height: 44px;
        display: block;
      }
      .active-icon {
        position: absolute;
        display: block;
        top: 8px;
        left: -16px;
      }
      .text {
        text-align: center;
        font-family: PingFang SC, PingFang SC;
        font-weight: 400;
        font-size: 12px;
        color: #9097a5;
        line-height: 14px;
        margin-top: 3px;
      }
    }
  }
}
</style>
