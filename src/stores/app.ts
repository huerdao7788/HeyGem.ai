import { defineStore } from 'pinia'

// 定义一个函数类型，用于解决Promise
type ResolveFunction = () => void

// 定义初始状态的类型
interface AppState {
  showAppLogin: boolean
}

let loginedResolve: ResolveFunction = () => {}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    showAppLogin: false
  }),
  actions: {
    setShowAppLogin(show: boolean): void {
      this.showAppLogin = show
      if (!show) loginedResolve()
    },
    async loginApp(): Promise<void> {
      return new Promise<void>((resolve) => {
        this.setShowAppLogin(true)
        loginedResolve = resolve
      })
    }
  }
})
