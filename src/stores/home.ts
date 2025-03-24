import { reactive } from 'vue'
import { defineStore } from 'pinia'

// 定义首页状态的类型
interface HomeState {
  modelNum: number
  videoNum: number
  agreementVisible: boolean
  language: string
  isAgree: boolean
}

export const useHomeStore = defineStore('home', () => {
  const homeState = reactive<HomeState>({
    modelNum: 0,
    videoNum: 0,
    agreementVisible: false,
    language: 'zh',
    isAgree: false
  })

  const setModelNum = (data: number): void => {
    homeState.modelNum = data
  }

  const setVideoNum = (data: number): void => {
    homeState.videoNum = data
  }

  const setAgreementVisible = (data: boolean): void => {
    homeState.agreementVisible = data
  }

  const setLanguage = (data: string): void => {
    homeState.language = data
  }

  const setIsAgree = (data: boolean): void => {
    homeState.isAgree = data
  }

  return {
    homeState,
    setModelNum,
    setVideoNum,
    setAgreementVisible,
    setLanguage,
    setIsAgree
  }
})
