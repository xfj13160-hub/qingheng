<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, ref, watch } from 'vue'
import type { Metric, BodyEntry } from '../domain/types'
import { metricUnits } from '../domain/types'
import { parseDate, shiftDate, shortDate } from '../domain/dates'
import EmptyState from './EmptyState.vue'
const props = withDefaults(defineProps<{ entries: BodyEntry[]; metric: Metric; end: string; days?: number; compact?: boolean }>(), { days:30,compact:false })
const instance = getCurrentInstance(), selected = ref(-1)
const height = computed(() => props.compact ? 72 : 204)
const selectedEntry = computed(() => props.entries[selected.value])
let points: {x:number;y:number}[] = [], width = 300
const canvasId = `trend-${Math.random().toString(36).slice(2,9)}`
function render() { nextTick(() => {
  if (!props.entries.length) return
  uni.createSelectorQuery().in(instance?.proxy).select('.trend-canvas').boundingClientRect((rect: any) => {
    if (!rect?.width) return
    width = rect.width
    const ctx = uni.createCanvasContext(canvasId, instance?.proxy)
    const left = props.compact ? 4 : 35, right = width-8, top = 14, bottom = height.value-(props.compact?8:28)
    const values = props.entries.map(x => x[props.metric]!)
    const rawMin = Math.min(...values),rawMax = Math.max(...values), padding = Math.max((rawMax-rawMin)*.3, props.metric==='weight'?.5:1)
    const min = rawMin-padding, max=rawMax+padding
    const startTime=parseDate(shiftDate(props.end,1-props.days)).getTime(), endTime=parseDate(props.end).getTime()
    points=props.entries.map(x=>({x:left+(parseDate(x.date).getTime()-startTime)/Math.max(1,endTime-startTime)*(right-left),y:bottom-(x[props.metric]!-min)/(max-min)*(bottom-top)}))
    if(!props.compact){ctx.setFontSize(9);ctx.setTextAlign('right');ctx.setTextBaseline('middle');for(let i=0;i<4;i++){const y=top+i*(bottom-top)/3;ctx.setStrokeStyle('#e4e8dc');ctx.setLineWidth(.7);ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(right,y);ctx.stroke();ctx.setFillStyle('#949e8b');ctx.fillText((max-i*(max-min)/3).toFixed(1),left-8,y)}ctx.setTextAlign('left');ctx.fillText(shortDate(shiftDate(props.end,1-props.days)),left,height.value-8);ctx.setTextAlign('center');ctx.fillText(shortDate(shiftDate(props.end,-Math.floor(props.days/2))),left+(right-left)/2,height.value-8);ctx.setTextAlign('right');ctx.fillText(shortDate(props.end),right,height.value-8)}
    if(points.length>1){const gradient=ctx.createLinearGradient(0,top,0,bottom);gradient.addColorStop(0,'rgba(81,130,67,0.20)');gradient.addColorStop(1,'rgba(81,130,67,0.01)');ctx.setFillStyle(gradient);ctx.beginPath();ctx.moveTo(points[0].x,bottom);for(const p of points)ctx.lineTo(p.x,p.y);ctx.lineTo(points[points.length-1].x,bottom);ctx.closePath();ctx.fill();ctx.setStrokeStyle('#317349');ctx.setLineWidth(props.compact?1.8:2);ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke()}
    points.forEach((p,i)=>{if(props.compact&&i!==points.length-1)return;ctx.beginPath();ctx.arc(p.x,p.y,selected.value===i?4.5:3,0,Math.PI*2);ctx.setFillStyle('#f7f7f2');ctx.fill();ctx.setStrokeStyle('#317349');ctx.setLineWidth(1.5);ctx.stroke()});ctx.draw()
  }).exec()
}) }
function pick(e:any){if(!points.length)return;const x=e.detail?.x??e.touches?.[0]?.x;if(typeof x!=='number')return;selected.value=points.reduce((best,p,i)=>Math.abs(p.x-x)<Math.abs(points[best].x-x)?i:best,0);render()}
onMounted(render)
watch(()=>[props.entries,props.metric,props.days,props.end],()=>{selected.value=-1;render()},{deep:true})
</script>
<template><view class="trend-chart"><template v-if="entries.length"><view v-if="!compact" class="chart-caption"><text>{{ selectedEntry ? shortDate(selectedEntry.date) + ' · ' + selectedEntry[metric]?.toFixed(1) + ' ' + metricUnits[metric] : '点击数据点，查看当天记录' }}</text><text>{{ metricUnits[metric] }}</text></view><canvas :id="canvasId" :canvas-id="canvasId" class="trend-canvas" :style="{height:height+'px'}" @tap="pick" /></template><EmptyState v-else :compact="true" title="趋势，从第一次记录开始" :detail="compact ? '' : '记录两次以上，就能看见自己的变化。'" icon="chart" /></view></template>
<style scoped>.trend-canvas{width:100%}.chart-caption{font-size:10px;color:var(--muted);display:flex;align-items:center;justify-content:space-between;margin:4px 0 9px}.trend-chart{width:100%}</style>
