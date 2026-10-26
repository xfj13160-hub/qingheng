<script setup lang="ts">
import type { Nutrition } from '../domain/types'
import { display } from '../utils/ui'
defineProps<{ values: Nutrition; targets: Partial<Nutrition> }>()
const items = [{key:'protein' as const,label:'蛋白质',color:'#217143'},{key:'carbs' as const,label:'碳水',color:'#8d9c6a'},{key:'fat' as const,label:'脂肪',color:'#e8a15b'}]
</script>
<template><view class="nutrients"><view v-for="item in items" :key="item.key" class="nutrient"><view class="nutrient-head"><text>{{ item.label }}</text><text class="nutrient-unit">g</text></view><view class="nutrient-value">{{ display(values[item.key]) }}<text class="nutrient-target"> / {{ display(targets[item.key]) }}</text></view><view class="progress-track"><view class="progress-fill" :style="{ width: targets[item.key] ? Math.min(100, values[item.key] / targets[item.key]! * 100) + '%' : '0%', background:item.color }" /></view></view></view></template>
<style scoped>.nutrients{display:flex;gap:19px}.nutrient{flex:1;min-width:0}.nutrient-head{display:flex;justify-content:space-between;color:var(--muted);font-size:11px;margin-bottom:8px}.nutrient-unit{font-size:10px;color:#a1a99d}.nutrient-value{font-size:17px;font-weight:600;white-space:nowrap;margin-bottom:9px}.nutrient-target{font-size:11px;font-weight:400;color:var(--muted)}</style>
