import { defineStore } from 'pinia'
import { useAppStore } from './app'

// 用户信息类型
interface UserInfo {
  id?: string | number
  [key: string]: any
}

// 用户状态类型
interface UserState {
  userInfo: UserInfo
  token: string
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userInfo: {},
    token: ''
  }),
  getters: {
    isLogined: (state): boolean => !!state.token && !!state.userInfo?.id
  },
  actions: {
    setToken(token: string): void {
      // 已自动持久化
      this.token = token
    },
    setUserInfo(userInfo: UserInfo): void {
      this.userInfo = userInfo
    },
    logout(): void {
      this.token = ''
      this.userInfo = {}
    },
    async loginGuard(): Promise<UserInfo> {
      if (this.isLogined) {
        return this.userInfo
      } else {
        const appStore = useAppStore()
        await appStore.loginApp()
        if (this.isLogined) {
          return this.userInfo
        } else {
          throw new Error('登录失败')
        }
      }
    }
  }
})
