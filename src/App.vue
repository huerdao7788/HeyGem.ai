<script setup>
import MenuLIst from '@renderer/components/menuLIst.vue'
import { handleShowMenu } from '@renderer/utils/index.js'
import AppHeader from '@renderer/components/AppHeader.vue'
import Agreement from '@renderer/components/agreement.vue'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHomeStore } from '@renderer/stores/home'
import { useI18n } from 'vue-i18n'
import { agreementKey, lang_ } from '@/utils/const'

const { locale } = useI18n()
const unRoute = useRoute()
const home = useHomeStore()
const isShowMenu = ref(false)
watch(
  () => unRoute.path,
  (newPath) => {
    isShowMenu.value = handleShowMenu(newPath)
  }
)
onMounted(() => {
  const language = localStorage.getItem('language')
  if (language && language !== 'null') {
    locale.value = language
    home.setLanguage(language)
  } else {
    locale.value = 'zh'
    home.setLanguage('zh')
  }
  saveContextAjax(home.homeState.language)
  getContextAjax()
})
const saveContextAjax = async (lang) => {
  localStorage.setItem(lang_, lang)
}
const getContextAjax = async () => {
  try {
    const res = localStorage.getItem(agreementKey)
    if (res && res === 'true') {
      home.setIsAgree(true)
      home.setAgreementVisible(false)
    } else {
      home.setIsAgree(false)
      home.setAgreementVisible(true)
    }
  } catch (error) {
    console.log(error)
  }
}
</script>

<template>
  <div class="content-box">
    <AppHeader v-if="!isShowMenu" />
    <MenuLIst v-if="!isShowMenu" />
    <div
      class="router-content-box"
      :style="!isShowMenu ? 'margin-left: 76px;margin-top: 60px;' : ''"
    >
      <router-view v-slot="{ Component, route }">
        <component :is="Component" :key="route.path" />
      </router-view>
    </div>
    <Agreement v-model="home.homeState.agreementVisible" />
  </div>
</template>
<style lang="less" scoped>
.content-box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;

  .router-content-box {
    width: 100%;
  }
}

::-webkit-scrollbar {
  width: 10px;
  /* 滚动条的宽度 */
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  /* 轨道的背景颜色 */
}

::-webkit-scrollbar-thumb {
  background-color: #d3d3d3;
  /* 滑块的颜色 */
  border-radius: 5px;
  /* 滑块的圆角 */
}
</style>
