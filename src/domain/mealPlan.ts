import { foods } from '../data/foods'
import { isDate } from './dates'
import { emptyNutrition, portion } from './nutrition'
import type { Food, Meal, Nutrition } from './types'

export const planGoals = { lose: '减脂保肌', gain: '增肌塑形', maintain: '维持健康' } as const
// These multipliers are practical starting estimates, not measured expenditure.
export const activityLevels = [
  { key: 'low', label: '久坐为主，少量运动', factor: 1.2 },
  { key: 'light', label: '轻活动，每周约 1–3 次运动', factor: 1.375 },
  { key: 'moderate', label: '中等活动，每周约 3–5 次运动', factor: 1.55 },
  { key: 'high', label: '较多活动，体力工作或频繁训练', factor: 1.725 }
] as const
export const dietStyles = { mixed: '均衡饮食', vegetarian: '蛋奶素', vegan: '纯植物' } as const
export const exclusions = { milk: '乳制品', egg: '鸡蛋', soy: '大豆', nuts: '坚果花生', fish: '鱼虾', gluten: '含麸质或可能混入麸质的谷物' } as const
export type Exclusion = keyof typeof exclusions
export interface PlanInput {
  clientName: string
  age: number
  sex: 'male' | 'female'
  height: number
  weight: number
  activity: typeof activityLevels[number]['key']
  goal: keyof typeof planGoals
  diet: keyof typeof dietStyles
  excluded: Exclusion[]
  generalAdult: boolean
}
export interface SavedPlanner { ruleVersion: 1; date: string; variant: number; input: PlanInput }
export interface PlanTargets extends Nutrition {
  ree: number
  maintenance: number
  factor: number
  adjustment: number
  proteinPerKg: number
}
export interface PlannedFood { meal: Meal; food: Food; grams: number; min: number; max: number; step: number }
export interface DailyPlan {
  input: PlanInput
  date: string
  targets: PlanTargets
  items: PlannedFood[]
  actual: Nutrition
  matched: boolean
}
export const planSources = [
  { title: 'Mifflin–St Jeor，1990', url: 'https://pubmed.ncbi.nlm.nih.gov/2305711/', detail: '用于估算静息能量消耗。活动系数及目标热量调整是工具的起始设定，不是这篇论文给出的个体处方。' },
  { title: 'ISSN 蛋白质与运动立场声明，2017', url: 'https://pubmed.ncbi.nlm.nih.gov/28642676/', detail: '多数健康运动人群每日蛋白质参考为 1.4–2.0 g/kg。本工具维持、增肌、减脂默认分别取 1.6、1.8、2.0；具体取值是产品设定。' },
  { title: 'Helms 等，能量盈余试验，2023', url: 'https://doi.org/10.1186/s40798-023-00651-y', detail: '小样本、8 周的抗阻训练研究：更快增重主要伴随更多脂肪积累；不证明所有人需要同样盈余。本工具增肌从 +5% 起步。' },
  { title: 'Garthe 等，减重速度试验，2011', url: 'https://pubmed.ncbi.nlm.nih.gov/21558571/', detail: '运动员试验支持渐进减重与瘦体重保留。本工具 −15% 是温和起始设定，不是该试验验证的通用最佳缺口。' },
  { title: 'WHO 健康膳食，2026', url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet', detail: '成人每天至少 400 g 蔬果、25 g 天然膳食纤维，优先全谷物、豆类和不饱和脂肪。脂肪默认占能量 25%；食物库缺少纤维和微量营养素，菜单不声称已满足这些指标。' }
]

const inRange = (x: unknown, min: number, max: number): x is number => typeof x === 'number' && Number.isFinite(x) && x >= min && x <= max
const owns = (obj: object, key: unknown) => typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key)
export function validPlanInput(x: any): x is PlanInput {
  return !!x && typeof x.clientName === 'string' && x.clientName.length <= 30 && inRange(x.age, 19, 65) && Number.isInteger(x.age)
    && ['male', 'female'].includes(x.sex) && inRange(x.height, 130, 220) && inRange(x.weight, 35, 180)
    && activityLevels.some(a => a.key === x.activity) && owns(planGoals, x.goal) && owns(dietStyles, x.diet)
    && Array.isArray(x.excluded) && x.excluded.every((e: unknown) => owns(exclusions, e))
    && new Set(x.excluded).size === x.excluded.length && typeof x.generalAdult === 'boolean'
}
export function validSavedPlanner(x: any): x is SavedPlanner {
  return !!x && x.ruleVersion === 1 && isDate(x.date) && inRange(x.variant, 0, 9999) && Number.isInteger(x.variant) && validPlanInput(x.input)
}
export function calculateTargets(input: PlanInput): PlanTargets {
  if (!validPlanInput(input)) throw new Error('请完整填写客户资料；本工具支持 19–65 岁、身高 130–220 cm、体重 35–180 kg。')
  if (!input.generalAdult) throw new Error('孕期、哺乳期、肾病、糖尿病、饮食障碍或其他需要治疗性饮食的情况，请由医生或注册营养师制定方案。')
  const bmi = input.weight / (input.height / 100) ** 2
  if (bmi < 18.5 || bmi >= 30) throw new Error('当前 BMI 超出本工具自动规划范围（18.5–29.9），请由营养专业人员评估；BMI 不能区分肌肉与脂肪。')
  const ree = 10 * input.weight + 6.25 * input.height - 5 * input.age + (input.sex === 'male' ? 5 : -161)
  const factor = activityLevels.find(x => x.key === input.activity)!.factor
  const maintenance = ree * factor
  const adjustment = input.goal === 'lose' ? -0.15 : input.goal === 'gain' ? 0.05 : 0
  const kcal = Math.round(maintenance * (1 + adjustment) / 10) * 10
  // Product boundaries are deliberately conservative and are not universal safety cut-offs.
  if (kcal < (input.sex === 'male' ? 1500 : 1200) || kcal > 4000) throw new Error('估算热量超出本工具自动生成范围，请由营养专业人员评估，不自动降低或抬高目标。')
  const proteinPerKg = input.goal === 'lose' ? 2 : input.goal === 'gain' ? 1.8 : 1.6
  const protein = Math.round(input.weight * proteinPerKg)
  const fat = Math.round(kcal * 0.25 / 9)
  const carbs = Math.round((kcal - protein * 4 - fat * 9) / 4)
  if (carbs < 130) throw new Error('当前参数不适合本工具的均衡饮食模板，请由营养专业人员调整。')
  return { ree, maintenance, factor, adjustment, proteinPerKg, kcal, protein, carbs, fat }
}

const tags: Partial<Record<string, Exclusion[]>> = {
  '燕麦片': ['gluten'], '全麦面包': ['gluten'], '面条': ['gluten'], '荞麦面': ['gluten'], '馒头': ['gluten'],
  '鸡蛋': ['egg'], '蛋白': ['egg'], '北豆腐': ['soy'], '嫩豆腐': ['soy'], '毛豆': ['soy'], '豆浆': ['soy'],
  '全脂牛奶': ['milk'], '脱脂牛奶': ['milk'], '无糖酸奶': ['milk'], '希腊酸奶': ['milk'], '乳清蛋白粉': ['milk'],
  '三文鱼': ['fish'], '鳕鱼': ['fish'], '虾仁': ['fish'], '金枪鱼': ['fish'],
  '杏仁': ['nuts'], '核桃': ['nuts'], '花生': ['nuts'], '腰果': ['nuts'], '花生酱': ['nuts']
}
const meat = ['鸡胸肉', '鸡腿肉', '牛里脊', '瘦猪肉', '三文鱼', '鳕鱼', '虾仁', '金枪鱼']
export function allowedFood(food: Food, input: PlanInput): boolean {
  if ((tags[food.name] || []).some(t => input.excluded.includes(t))) return false
  if (input.diet !== 'mixed' && meat.includes(food.name)) return false
  if (input.diet === 'vegan' && (tags[food.name] || []).some(t => ['milk', 'egg'].includes(t))) return false
  return true
}
export function planNutrition(items: PlannedFood[]): Nutrition {
  return items.reduce((acc, item) => {
    const n = portion(item.food, item.grams)
    for (const k of Object.keys(acc) as (keyof Nutrition)[]) acc[k] += n[k]
    return acc
  }, emptyNutrition())
}
function makeMenu(input: PlanInput, targets: PlanTargets, seed: number): PlannedFood[] {
  const result: PlannedFood[] = []
  const scale = targets.kcal / 2200
  let cursor = seed
  function add(meal: Meal, names: string[], initial: number, min: number, max: number, step = 5, optional = false) {
    const pool = names.map(n => foods.find(f => f.name === n)!).filter(f => f && allowedFood(f, input))
    if (!pool.length) { if (optional) return; throw new Error('当前饮食偏好和排除项使食物选择过少，无法生成均衡菜单。请调整选择或请营养师定制。') }
    cursor = (Math.imul(cursor, 1664525) + 1013904223) >>> 0
    const food = pool[Math.floor(cursor / 4294967296 * pool.length)]
    result.push({ meal, food, min, max, step, grams: Math.max(min, Math.min(max, Math.round(initial * scale / step) * step)) })
  }
  const proteins = input.diet === 'mixed' ? ['鸡胸肉', '鳕鱼', '瘦猪肉', '虾仁', '三文鱼', '北豆腐'] : ['北豆腐', '毛豆', '鹰嘴豆']
  add('breakfast', ['燕麦片', '全麦面包', '玉米'], 60, 40, 150)
  add('breakfast', ['鸡蛋', '北豆腐', '毛豆'], 100, 50, 200, 50)
  add('breakfast', ['脱脂牛奶', '豆浆', '希腊酸奶'], 250, 150, 350)
  add('breakfast', ['香蕉', '苹果', '猕猴桃'], 120, 100, 200)
  for (const meal of ['lunch', 'dinner'] as Meal[]) {
    add(meal, ['米饭', '糙米饭', '藜麦', '红薯'], 230, 100, 400)
    add(meal, proteins, 160, 80, 300)
    add(meal, ['西兰花', '菠菜', '白菜', '彩椒'], 180, 150, 250)
    add(meal, ['橄榄油'], 12, 5, 25)
  }
  add('snack', ['希腊酸奶', '豆浆', '毛豆'], 200, 150, 350)
  add('snack', ['苹果', '橙子', '蓝莓'], 150, 100, 200)
  add('snack', ['杏仁', '核桃', '花生'], 15, 10, 30, 5, true)
  return result
}
function score(n: Nutrition, t: Nutrition): number {
  return (['kcal', 'protein', 'carbs', 'fat'] as const).reduce((s, k) => s + ((n[k] - t[k]) / t[k]) ** 2 * (k === 'kcal' || k === 'protein' ? 2 : 1), 0)
}
function fitMenu(items: PlannedFood[], targets: PlanTargets): PlannedFood[] {
  let current = score(planNutrition(items), targets)
  // Bounded coordinate descent; portions stay within practical, visible serving limits.
  for (let pass = 0; pass < 180; pass++) {
    let best = current, index = -1, grams = 0
    for (let i = 0; i < items.length; i++) {
      const item = items[i], original = item.grams
      for (const next of [original - item.step, original + item.step]) {
        if (next < item.min || next > item.max) continue
        item.grams = next
        const candidate = score(planNutrition(items), targets)
        if (candidate < best - 1e-10) { best = candidate; index = i; grams = next }
      }
      item.grams = original
    }
    if (index < 0) break
    items[index].grams = grams
    current = best
  }
  return items
}
export function generateDailyPlan(input: PlanInput, date: string, variant = 0): DailyPlan {
  if (!isDate(date) || !inRange(variant, 0, 9999) || !Number.isInteger(variant)) throw new Error('计划日期或菜单编号无效。')
  const targets = calculateTargets(input)
  const seed = Number(date.replace(/-/g, '')) + variant * 13
  let best: PlannedFood[] | undefined
  for (let i = 0; i < 12; i++) {
    const candidate = fitMenu(makeMenu(input, targets, seed + i), targets)
    if (!best || score(planNutrition(candidate), targets) < score(planNutrition(best), targets)) best = candidate
  }
  const actual = planNutrition(best!)
  const matched = (['kcal', 'protein', 'carbs', 'fat'] as const).every(k => Math.abs(actual[k] - targets[k]) / targets[k] <= (k === 'kcal' || k === 'protein' ? 0.1 : 0.2))
  return { input: JSON.parse(JSON.stringify(input)), date, targets, items: best!, actual, matched }
}
