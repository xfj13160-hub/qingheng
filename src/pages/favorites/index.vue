<script setup lang="ts">
import { computed,ref } from 'vue'
import AppPage from '../../components/AppPage.vue'
import Icon from '../../components/Icon.vue'
import EmptyState from '../../components/EmptyState.vue'
import PhotoThumb from '../../components/PhotoThumb.vue'
import { useHealthStore } from '../../stores/health'
import { navigate,toast } from '../../utils/ui'
const store=useHealthStore(),search=ref('')
const items=computed(()=>store.allFoods.filter(x=>store.data.favorites.includes(x.id)&&x.name.includes(search.value.trim())))
function remove(id:string){if(store.toggleFavorite(id))toast('已从常吃中移除')}
</script>
<template><AppPage title="常吃食物"><text class="eyebrow">YOUR EVERYDAY FAVORITES</text><text class="page-title">熟悉的味道，轻松记</text><text class="page-description">收藏经常吃的食物，下次不必重新寻找。</text><view class="input-wrap mt-24"><Icon name="search" tone="muted" :size="18"/><input v-model="search" placeholder="搜索我的常吃食物"/></view><view v-if="items.length" class="entry-list mt-24"><view v-for="food in items" :key="food.id" class="entry-row"><PhotoThumb :art="food.art"/><view class="grow" @click="navigate('food','food='+food.id)"><text class="entry-name">{{ food.name }}</text><text class="entry-detail">{{ food.state }} · {{ food.kcal }} kcal / 100g</text><button role="button" class="text-link favorite-record" @click.stop="navigate('food','food='+food.id)">记一份<Icon name="plus" :size="12"/></button></view><button role="button" class="icon-button plain" :aria-label="'取消常吃'+food.name" @click="remove(food.id)"><Icon name="star" tone="orange" :size="20"/></button></view></view><EmptyState v-else title="把喜欢的食物留在这里" detail="记录饮食时勾选「加入常吃」，下次就能快速找到。" icon="star"><button role="button" class="btn-primary btn-small mt-16" @click="navigate('food')">去记一餐<Icon name="arrow" tone="white" :size="15"/></button></EmptyState><text class="footer-note">取消常吃不会删除已有饮食记录。</text></AppPage></template>
<style scoped>.entry-row{padding:12px}.entry-row .photo-thumb{width:54px;height:63px;border-radius:12px}.favorite-record{font-size:10px;justify-content:flex-start;margin-top:7px}.entry-name{font-size:13px}</style>
