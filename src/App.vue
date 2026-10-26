<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useHealthStore } from './stores/health'
onLaunch(() => { useHealthStore().hydrate() })
</script>
<style lang="scss">@import './styles/global.scss';</style>
