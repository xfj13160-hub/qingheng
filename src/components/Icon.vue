<script setup lang="ts">
withDefaults(defineProps<{ name: string; tone?: string; size?: number }>(), { tone: 'green', size: 20 });
</script>
<template><image class="ui-icon" :src="`/static/icons/${name}-${tone}.png`" :style="{ width: size + 'px', height: size + 'px' }" mode="aspectFit" /></template>
<style scoped>.ui-icon { display: inline-block; flex-shrink: 0; vertical-align: middle; }</style>
