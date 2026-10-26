import type { BodyEntry, MealEntry, Metric, Nutrition, Snapshot } from './types'
import { shiftDate, weekStart } from './dates'
export const emptyNutrition = (): Nutrition => ({ kcal: 0, protein: 0, carbs: 0, fat: 0 })
export function portion(food: Nutrition, grams: number): Nutrition { const n = emptyNutrition(); for (const k of Object.keys(n) as (keyof Nutrition)[]) n[k] = food[k] * grams / 100; return n }
export function total(entries: MealEntry[]): Nutrition { return entries.reduce((acc, item) => { const n = portion(item.per100, item.grams); for (const k of Object.keys(acc) as (keyof Nutrition)[]) acc[k] += n[k]; return acc }, emptyNutrition()) }
export function bmi(weight?: number, height?: number): number | undefined { return weight && height ? weight / ((height / 100) ** 2) : undefined }
export function metricRecords(items: BodyEntry[], metric: Metric, end: string, days: number): BodyEntry[] { const start = shiftDate(end, 1 - days); return items.filter(x => x.date >= start && x.date <= end && x[metric] !== undefined).sort((a, b) => a.date.localeCompare(b.date)) }
export function averageWeight(items: BodyEntry[], end: string): number | undefined { const entries = metricRecords(items, 'weight', end, 7); return entries.length ? entries.reduce((s, x) => s + x.weight!, 0) / entries.length : undefined }
export function weeklySummary(data: Snapshot, selected: string) {
  const start = weekStart(selected), end = shiftDate(start, 6)
  const meals = data.meals.filter(x => x.date >= start && x.date <= end)
  const dates = [...new Set(meals.map(x => x.date))]
  const training = data.training.filter(x => x.date >= start && x.date <= end)
  const weights = metricRecords(data.bodies, 'weight', end, 7)
  const kcal = data.profile.targets.kcal
  const protein = data.profile.targets.protein
  return { start, end, days: dates.length, sessions: training.length, minutes: training.reduce((s, x) => s + x.minutes, 0),
    averageKcal: dates.length ? total(meals).kcal / dates.length : undefined,
    energyDays: kcal ? dates.filter(d => { const n = total(meals.filter(x => x.date === d)).kcal; return n >= kcal * 0.9 && n <= kcal * 1.1 }).length : undefined,
    proteinDays: protein ? dates.filter(d => total(meals.filter(x => x.date === d)).protein >= protein).length : undefined,
    weightChange: weights.length >= 2 ? weights[weights.length - 1].weight! - weights[0].weight! : undefined }
}
export function advice(data: Snapshot, date: string): { title: string; detail: string; action: string } {
  const entries = data.meals.filter(x => x.date === date)
  if (!entries.length) return { title: '从一餐开始，慢慢建立节奏', detail: '今天还没有饮食记录。记下第一餐，就能看见营养摄入。', action: '记录第一餐' }
  const n = total(entries), t = data.profile.targets
  if (!t.kcal && !t.protein) return { title: '给每天的记录一个方向', detail: '设置你自己的热量与营养目标，获得有依据的进度提醒。', action: '设置目标' }
  if (t.kcal && n.kcal > t.kcal) return { title: '今天的记录已超过热量目标', detail: `已记录 ${Math.round(n.kcal)} kcal，比目标多 ${Math.round(n.kcal - t.kcal)} kcal。核对份量即可，无需用额外训练补偿。`, action: '查看饮食' }
  if (t.protein && n.protein < t.protein) return { title: '下一餐，给蛋白质留个位置', detail: `按已记录食物计算，距离蛋白质目标还差 ${Math.round(t.protein - n.protein)} g。未记录的餐食不会计入。`, action: '继续记录' }
  return { title: '每一次记录，都在帮助你了解自己', detail: `今天已记录 ${entries.length} 项食物。结合身体趋势，观察适合自己的节奏。`, action: '查看趋势' }
}
