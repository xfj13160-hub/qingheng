<script setup lang="ts">
import { computed } from 'vue'
import { dateKey, parseDate, shiftDate, weekDays, weekStart } from '../domain/dates'
import Icon from './Icon.vue'
const props = withDefaults(defineProps<{ modelValue: string; marks?: string[] }>(), { marks: () => [] })
const emit = defineEmits<{ (e:'update:modelValue', value: string): void }>()
const days = computed(() => weekDays(props.modelValue))
const canNext = computed(() => weekStart(shiftDate(props.modelValue,7)) <= weekStart(dateKey()))
const nextWeek = () => choose(shiftDate(props.modelValue,7) > dateKey() ? dateKey() : shiftDate(props.modelValue,7))
const labels = ['一','二','三','四','五','六','日']
const month = computed(() => `${parseDate(props.modelValue).getFullYear()}年${parseDate(props.modelValue).getMonth()+1}月`)
const choose = (date: string) => emit('update:modelValue',date)
const pickerChange = (e: any) => choose(e.detail.value)
</script>
<template><view class="date-strip"><view class="row-between date-heading"><picker mode="date" :value="modelValue" :end="dateKey()" @change="pickerChange"><view class="date-picker">{{ month }}<text class="tiny-caret">▾</text></view></picker><view class="row gap-8"><button role="button" class="text-link date-today" @click="choose(dateKey())">回到今天</button><button role="button" class="icon-button small" aria-label="上一周" @click="choose(shiftDate(modelValue,-7))"><Icon name="back" :size="15" /></button><button role="button" class="icon-button small" aria-label="下一周" :disabled="!canNext" @click="nextWeek"><Icon name="arrow" :size="15" /></button></view></view><view class="date-week"><button role="button" v-for="(day,i) in days" :key="day" class="date-day" :class="{ active: day === modelValue, today: day === dateKey() }" :disabled="day > dateKey()" :aria-label="day" @click="choose(day)"><text class="weekday">{{ labels[i] }}</text><text class="day-num">{{ parseDate(day).getDate() }}</text><view class="date-dot" :class="{ marked: marks.includes(day) }" /></button></view></view></template>
<style scoped>.date-strip{margin:20px 0}.date-heading{margin-bottom:15px}.date-picker{font-size:13px;font-weight:600}.tiny-caret{margin-left:6px;color:var(--muted)}.date-today{font-size:10px!important}.date-week{display:flex;justify-content:space-between;gap:5px}.date-day{flex:1;max-width:48px;padding:10px 0 7px;display:flex;flex-direction:column;border-radius:17px;background:transparent;gap:6px;line-height:1}.weekday{font-size:10px;color:var(--muted)}.day-num{font-size:16px;font-weight:600}.date-dot{width:3px;height:3px;border-radius:50%;background:transparent}.date-dot.marked{background:var(--green)}.today .day-num{color:var(--green)}.active{background:var(--forest)!important;color:white!important;box-shadow:0 5px 10px #173e2b16}.active .weekday{color:#d1decb}.active .day-num{color:white}.active .marked{background:#b7d0a9}.date-day[disabled]{opacity:.3}</style>
