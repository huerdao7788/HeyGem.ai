<template>
  <div class="header">
    <div class="header-left">
      <img class="logo" src="@renderer/assets/images/icons/logo.png" alt="logo" />
    </div>
    <div class="header-right">
      <t-dropdown
        :maxColumnWidth="'auto'"
        :min-column-width="88"
        panel-top-content=""
        placement="bottom-right"
        @click="action.clickHandler"
      >
        <div class="header-right-item" style="width: 70px">
          <img src="@renderer/assets/images/icons/setting.svg" alt="setting" />
          <div class="header-right-item-text">{{ $t('common.setting.title') }}</div>
        </div>
        <t-dropdown-menu>
          <t-dropdown-item
            :value="item.value"
            v-for="(item, index) in state.menuList"
            :key="index + 'menuList'"
            class="dropdown-box"
          >
            <div class="language-switch-box">
              <span>{{ item.content }}</span>
              <img
                v-if="item.value === 'languageSwitch'"
                src="@renderer/assets/images/icons/switch.svg"
                alt="switch"
                class="language-switch"
              />
            </div>

            <t-dropdown-menu v-if="item.children">
              <t-dropdown-item
                v-for="(itemChildren, indexChildren) in item.children"
                :key="indexChildren + 'itemChildren'"
                :value="itemChildren.value"
                :class="itemChildren.value === home.homeState.language ? 'language-active' : ''"
                >{{ itemChildren.content }}</t-dropdown-item
              >
            </t-dropdown-menu>
          </t-dropdown-item>
        </t-dropdown-menu>
      </t-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useHomeStore } from '@renderer/stores/home'
import { useI18n } from 'vue-i18n'
import { agreementKey, lang_ } from '@renderer/utils/const'

// 定义菜单项接口
interface MenuItem {
  content: string
  key: string
  value: string
  children?: MenuItem[]
}

// 定义组件状态接口
interface HeaderState {
  menuList: MenuItem[]
}

const { locale, t } = useI18n()
const home = useHomeStore()
const state = reactive<HeaderState>({
  menuList: [
    {
      content: '用户协议',
      key: 'common.setting.tab.userAgreementText',
      value: 'agreement'
    },
    {
      content: '语言切换',
      value: 'languageSwitch',
      key: 'common.setting.tab.languageSwitchText',
      children: [
        {
          content: '中文',
          key: 'common.setting.languageSwitch.languageZhText',
          value: 'zh'
        },
        {
          content: '英文',
          key: 'common.setting.languageSwitch.languageEnText',
          value: 'en'
        }
      ]
    }
  ]
})

watch(locale, () => {
  state.menuList.forEach((el) => {
    el.content = t(el.key)
    if (el.children) el.children.forEach((item) => (item.content = t(item.key)))
  })
})

const action = {
  clickHandler({ value }: { value: string }): void {
    if (value === 'agreement') {
      home.setAgreementVisible(true)
    } else {
      if (value === 'languageSwitch') return
      if (value === 'zh' || value === 'en') {
        window.localStorage.setItem('language', value)
        locale.value = value
        saveContextAjax(value)
        home.setLanguage(value)
      }
    }
  }
}

const saveContextAjax = async (lang: string): Promise<void> => {
  localStorage.setItem(lang_, lang)
}
</script>
<style>
.dropdown-box .t-icon-chevron-right {
  display: none !important;
}

.language-active {
  color: #166aff !important;
}

.t-dropdown__item-text .language-switch {
  width: 16px;
  display: block;
  margin-left: 14px;
}
</style>

<style lang="less" scoped>
.language-switch-box {
  display: flex;
}

.header {
  width: 100%;
  height: 60px;
  padding: 12px 20px 12px 14px;
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  align-items: center;
  background-color: #fff;
  z-index: 999;
  box-shadow: inset 0px -1px 0px 0px #f2f2f4;

  &-left {
    width: 100%;
    flex: 1;
    height: 100%;

    .logo {
      width: 200px;
      height: 36px;
    }
  }

  &-right {
    display: flex;
    align-items: center;
    gap: 8px;

    &-item {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;

      &:hover {
        background-color: #f2f2f4;
      }

      &-text {
        font-family:
          PingFang SC,
          PingFang SC;
        font-weight: 400;
        font-size: 12px;
        color: #000000;
        line-height: 14px;
        text-align: left;
      }

      img {
        width: 20px;
        height: 20px;
      }
    }
  }
}
</style>
