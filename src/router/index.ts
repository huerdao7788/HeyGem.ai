import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import home from '@renderer/views/home/index.vue'
import account from '@renderer/views/account/index.vue'
import VideoEditView from '@renderer/views/video-edit/VideoEditView.vue'
import VoiceManagement from '@renderer/views/voice-management/index.vue'

// 定义路由记录
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'root',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'home',
    component: home
  },
  {
    path: '/video/edit',
    name: 'videoEdit',
    component: VideoEditView
  },
  {
    path: '/account',
    name: 'account',
    component: account
  },
  {
    path: '/voice/management',
    name: 'voiceManagement',
    component: VoiceManagement
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
