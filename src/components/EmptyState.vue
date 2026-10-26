<script setup lang="ts">
import Icon from './Icon.vue'; withDefaults(defineProps<{ title: string; detail?: string; icon?: string; compact?: boolean }>(), { detail: '', icon: 'leaf', compact: false });
</script>
<template><view class="empty-state" :class="{compact}"><view class="empty-icon"><Icon :name="icon" :size="25" /></view><text class="empty-title">{{ title }}</text><text v-if="detail" class="empty-detail">{{ detail }}</text><slot /></view></template>
<style scoped>.empty-state{display:flex;flex-direction:column;align-items:center;text-align:center;padding:28px 18px;gap:10px}.empty-icon{width:54px;height:54px;border-radius:20px;background:#eaf0e4;display:flex;align-items:center;justify-content:center;margin-bottom:3px}.empty-title{font-size:15px;font-weight:600}.empty-detail{font-size:12px;line-height:1.9;color:var(--muted);max-width:250px}.compact{padding:20px 12px}.compact .empty-icon{width:40px;height:40px;border-radius:14px}.compact .empty-title{font-size:13px}</style>
