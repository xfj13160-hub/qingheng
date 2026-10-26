<script setup lang="ts">
import { getCurrentInstance, nextTick, onMounted, watch } from 'vue'
const props = defineProps<{ value: number; target?: number }>()
const instance = getCurrentInstance()
function draw() { nextTick(() => { const ctx = uni.createCanvasContext('energy-ring', instance?.proxy); ctx.setLineWidth(9); ctx.setStrokeStyle('#e7eadd'); ctx.beginPath(); ctx.arc(76,76,64,0,Math.PI*2); ctx.stroke(); if (props.target && props.value > 0) { ctx.setLineCap('round'); ctx.setStrokeStyle(props.value > props.target ? '#de9653' : '#267847'); ctx.beginPath(); ctx.arc(76,76,64,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,props.value/props.target)); ctx.stroke() } ctx.draw() }) }
onMounted(draw); watch(() => [props.value,props.target],draw)
</script>
<template><view class="energy-ring"><canvas class="ring-canvas" canvas-id="energy-ring" id="energy-ring" /><view class="ring-center"><text class="ring-caption">今日摄入</text><text class="ring-value number">{{ Math.round(value).toLocaleString() }}</text><text class="ring-unit">kcal</text></view></view></template>
<style scoped>.energy-ring{position:relative;width:152px;height:152px;flex-shrink:0}.ring-canvas{width:152px;height:152px}.ring-center{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;pointer-events:none}.ring-caption{font-size:10px;color:var(--muted);letter-spacing:1px;margin-bottom:4px}.ring-value{font-size:34px;font-weight:650;line-height:1.2}.ring-unit{font-size:10px;color:var(--muted);margin-top:5px;letter-spacing:.5px}</style>
