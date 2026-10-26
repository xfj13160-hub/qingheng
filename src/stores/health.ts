import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { foods } from '../data/foods'
import type { BodyEntry, Food, MealEntry, Profile, Snapshot, TrainingEntry } from '../domain/types'
import { blankSnapshot, createRepository } from '../services/repository'
import { shiftDate } from '../domain/dates'
const repository = () => createRepository({ get: key => uni.getStorageSync(key), set: (key, value) => uni.setStorageSync(key, value) })
export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
export const useHealthStore = defineStore('health', () => {
  const data = ref<Snapshot>(blankSnapshot()), storageIssue = ref(''), ready = ref(false)
  const allFoods = computed(() => [...foods, ...data.value.customFoods])
  function hydrate() { if (ready.value) return; try { data.value = repository().read() } catch (e) { storageIssue.value = (e as Error).message; uni.showModal({ title: '本地记录读取失败', content: storageIssue.value, showCancel: false }) } finally { ready.value = true } }
  function transact(change: (next: Snapshot) => void): boolean {
    if (storageIssue.value) { uni.showToast({ title: '本地数据异常，已停止写入', icon: 'none' }); return false }
    const next: Snapshot = JSON.parse(JSON.stringify(data.value)); change(next)
    try { repository().write(next); data.value = next; return true } catch (e) { uni.showModal({ title: '没有保存成功', content: `请检查设备存储空间后重试。${(e as Error).message}`, showCancel: false }); return false }
  }
  function saveProfile(profile: Profile) { return transact(d => { d.profile = profile; d.onboarded = true }) }
  function finishWelcome() { return transact(d => { d.onboarded = true }) }
  function saveMeal(entry: MealEntry, custom?: Food, favorite?: boolean) { return transact(d => { const i = d.meals.findIndex(x => x.id === entry.id); if (i < 0) d.meals.push(entry); else d.meals[i] = entry; if (custom) { const j=d.customFoods.findIndex(x=>x.id===custom.id); if(j<0)d.customFoods.push(custom); else d.customFoods[j]=custom } if (favorite === true && !d.favorites.includes(entry.foodId)) d.favorites.push(entry.foodId); if (favorite === false) d.favorites = d.favorites.filter(x => x !== entry.foodId) }) }
  function deleteMeal(id: string) { return transact(d => { d.meals = d.meals.filter(x => x.id !== id) }) }
  function saveBody(entry: BodyEntry) { return transact(d => { d.bodies=d.bodies.filter(x=>x.id!==entry.id&&x.date!==entry.date); d.bodies.push(entry) }) }
  function deleteBody(id: string) { return transact(d => { d.bodies = d.bodies.filter(x => x.id !== id) }) }
  function saveTraining(entry: TrainingEntry) { return transact(d => { const i = d.training.findIndex(x => x.id === entry.id); if (i < 0) d.training.push(entry); else d.training[i] = entry }) }
  function deleteTraining(id: string) { return transact(d => { d.training = d.training.filter(x => x.id !== id) }) }
  function toggleFavorite(id: string) { return transact(d => { d.favorites = d.favorites.includes(id) ? d.favorites.filter(x => x !== id) : [...d.favorites, id] }) }
  function copyYesterday(date: string) { const source = data.value.meals.filter(x => x.date === shiftDate(date, -1)); if (!source.length) return false; return transact(d => { d.meals.push(...source.map(x => ({ ...x, id: newId(), date, photo: undefined }))) }) }
  return { data, allFoods, storageIssue, hydrate, saveProfile, finishWelcome, saveMeal, deleteMeal, saveBody, deleteBody, saveTraining, deleteTraining, toggleFavorite, copyYesterday }
})
