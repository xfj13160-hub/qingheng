<script setup lang="ts">
import Icon from './Icon.vue'
import { back, navigate } from '../utils/ui'
withDefaults(defineProps<{ title?: string; tab?: string; subtitle?: string }>(), { title: '', tab: '', subtitle: '' })
const info = uni.getSystemInfoSync()
const top = info.statusBarHeight || 0
const tabs = [{ key:'today', name:'今日', icon:'home' },{ key:'diet', name:'饮食', icon:'bowl' },{ key:'training', name:'训练', icon:'dumbbell' },{ key:'profile', name:'我的', icon:'user' }]
function switchTab(key: string) { uni.redirectTo({ url: `/pages/${key}/index` }) }
</script>
<template>
  <view class="app-shell">
    <view class="app-header" :style="{ paddingTop: top + 16 + 'px' }">
      <view v-if="tab" class="brand" @click="tab !== 'today' && switchTab('today')"><view class="brand-mark"><Icon name="leaf" tone="white" :size="23" /></view><text class="brand-name">轻衡</text><text class="brand-divider">/</text><text class="brand-note">好好吃，慢慢变好</text></view>
      <view v-else class="sub-header"><button role="button" class="icon-button back-button" aria-label="返回" @click="back"><Icon name="back" tone="white" :size="22" /></button><text class="sub-title">{{ title }}</text></view>
      <!-- #ifdef H5 --><button role="button" v-if="tab" class="header-action" aria-label="每周回顾" @click="navigate('weekly')"><Icon name="calendar" tone="white" :size="21" /></button><!-- #endif -->
    </view>
    <view class="page-surface" :class="{ 'with-tabs': tab }"><slot /></view>
    <view v-if="tab" class="bottom-nav">
      <button role="button" v-for="item in tabs" :key="item.key" class="tab-item" :class="{ selected: tab === item.key }" :aria-label="item.name" @click="tab !== item.key && switchTab(item.key)"><view class="tab-icon"><Icon :name="item.icon" :tone="tab === item.key ? 'green' : 'muted'" :size="22" /></view><text>{{ item.name }}</text><view v-if="tab === item.key" class="tab-dot" /></button>
    </view>
  </view>
</template>
<style scoped lang="scss">
.app-shell{background:var(--forest);min-height:100vh}.app-header{padding:16px 23px 18px;display:flex;align-items:center;justify-content:space-between;min-height:66px;box-sizing:content-box}.brand{display:flex;align-items:center;gap:9px}.brand-mark{width:31px;height:31px;border:1px solid #ffffff4d;border-radius:50%;display:flex;align-items:center;justify-content:center}.brand-name{color:#fff;font-size:25px;font-weight:700;letter-spacing:2px}.brand-divider{color:#ffffff4a;margin:0 1px;font-weight:300}.brand-note{font-size:11px;color:#d0dcc9;letter-spacing:1px}.header-action{background:#ffffff12;border:1px solid #ffffff16;width:36px;height:36px;border-radius:50%;padding:0}.sub-header{display:flex;align-items:center;gap:14px}.sub-title{color:white;font-size:18px;font-weight:600}.back-button{background:#ffffff10}.page-surface{border-radius:28px 28px 0 0;background:var(--paper);padding:27px 23px 32px;min-height:calc(100vh - 100px);box-sizing:border-box}.with-tabs{padding-bottom:115px}.bottom-nav{position:fixed;z-index:50;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;display:flex;background:rgba(252,252,247,.97);border-top:1px solid var(--line);padding:10px 8px calc(12px + env(safe-area-inset-bottom));box-sizing:border-box}.tab-item{flex:1;position:relative;border:0;background:transparent;flex-direction:column;gap:4px;font-size:11px;line-height:1.4;color:var(--muted);padding:0}.tab-icon{height:27px;display:flex;align-items:center;justify-content:center;width:46px;border-radius:13px}.selected{color:var(--green);font-weight:600}.selected .tab-icon{background:#e5eddf}.tab-dot{position:absolute;width:3px;height:3px;border-radius:50%;background:var(--green);bottom:-6px}
/* #ifdef MP-WEIXIN */
.app-header{padding-right:106px;min-height:40px}.brand-note,.brand-divider{display:none}
/* #endif */
</style>
