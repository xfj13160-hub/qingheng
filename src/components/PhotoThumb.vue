<script setup lang="ts">
import { ref, watch } from 'vue'
import { resolvePhoto } from '../services/photos'
const props = withDefaults(defineProps<{ photo?: string; art?: string }>(), { art:'salad' })
const src = ref('')
watch(() => [props.photo,props.art],async () => { const expected = props.photo; src.value = `/static/food/${props.art}.png`; if (expected) try { const url = await resolvePhoto(expected); if (props.photo === expected) src.value = url } catch { /* 使用食物插画作为照片不可用时的占位。 */ } },{immediate:true})
</script>
<template><image class="photo-thumb" :src="src" mode="aspectFill" /></template>
<style scoped>.photo-thumb{width:70px;height:70px;flex-shrink:0;border-radius:15px;background:#ebe8df}</style>
