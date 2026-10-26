import type { Snapshot } from '../domain/types'
import { isDate } from '../domain/dates'
export const STORAGE_KEY = 'qingheng:data:v1'
export function blankSnapshot(): Snapshot { return { version: 1, onboarded: false, profile: { name: '', goal: '减脂保肌', targets: {} }, meals: [], bodies: [], training: [], customFoods: [], favorites: [] } }
const finite = (n: unknown, min = 0, max = 1e6): n is number => typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max
const optional = (n: unknown, min = 0, max = 1e6) => n === undefined || finite(n, min, max)
const text = (s: unknown): s is string => typeof s === 'string'
function nutrient(n: any) { return n && ['kcal', 'protein', 'carbs', 'fat'].every(k => finite(n[k])) }
export function validSnapshot(d: any): d is Snapshot {
  try {
    return d?.version === 1 && typeof d.onboarded === 'boolean' && text(d.profile.name) && text(d.profile.goal) && optional(d.profile.height, 50, 250) && optional(d.profile.targetWeight, 20, 350)
      && d.profile.targets && ['kcal','protein','carbs','fat'].every(k => optional(d.profile.targets[k], 1, k === 'kcal' ? 10000 : 1000))
      && Array.isArray(d.meals) && d.meals.every((x: any) => text(x.id) && isDate(x.date) && ['breakfast','lunch','dinner','snack'].includes(x.meal) && text(x.foodId) && text(x.name) && finite(x.grams, 0.1, 10000) && nutrient(x.per100) && text(x.art) && (x.photo === undefined || text(x.photo)))
      && Array.isArray(d.bodies) && d.bodies.every((x: any) => text(x.id) && isDate(x.date) && optional(x.weight,20,350) && optional(x.waist,30,250) && optional(x.bodyFat,1,75) && [x.weight,x.waist,x.bodyFat].some(n => n !== undefined))
      && new Set(d.bodies.map((x: any) => x.date)).size === d.bodies.length
      && Array.isArray(d.training) && d.training.every((x: any) => text(x.id) && isDate(x.date) && text(x.type) && finite(x.minutes,1,1440) && text(x.feeling) && text(x.note))
      && Array.isArray(d.customFoods) && d.customFoods.every((x: any) => text(x.id) && text(x.name) && text(x.state) && text(x.category) && text(x.art) && nutrient(x))
      && Array.isArray(d.favorites) && d.favorites.every(text)
  } catch { return false }
}
export interface StorageAdapter { get(key: string): unknown; set(key: string, value: string): void }
export function createRepository(adapter: StorageAdapter) {
  return {
    read(): Snapshot { const raw = adapter.get(STORAGE_KEY); if (raw === '' || raw === undefined || raw === null) return blankSnapshot(); let data: unknown; try { data = typeof raw === 'string' ? JSON.parse(raw) : raw } catch { throw new Error('本地记录无法读取。原始数据已保留，请联系开发者协助恢复。') } if (!validSnapshot(data)) throw new Error('本地数据版本或格式异常。原始数据已保留，暂时停止写入。'); return data },
    write(data: Snapshot) { if (!validSnapshot(data)) throw new Error('记录中有无效数据，请检查后重试。'); adapter.set(STORAGE_KEY, JSON.stringify(data)) }
  }
}
