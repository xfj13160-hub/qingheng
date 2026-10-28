import { describe, expect, it } from 'vitest'
import { foods } from '../src/data/foods'
import { activityLevels, allowedFood, calculateTargets, generateDailyPlan, planNutrition } from '../src/domain/mealPlan'
import type { PlanInput } from '../src/domain/mealPlan'
import { blankSnapshot, createRepository, validSnapshot } from '../src/services/repository'

const client: PlanInput = { clientName: '测试客户', age: 25, sex: 'male', height: 175, weight: 75, activity: 'moderate', goal: 'lose', diet: 'mixed', excluded: [], generalAdult: true }

describe('每日营养计算', () => {
  it('按公式计算，不重复叠加训练消耗，三大营养素能量闭合', () => {
    const t = calculateTargets(client)
    expect(t.ree).toBe(1723.75)
    expect(t.maintenance).toBeCloseTo(2671.8125)
    expect(t.kcal).toBe(2270)
    expect(t.protein).toBe(150)
    expect(t.fat).toBe(63)
    expect(t.carbs).toBe(276)
    expect(Math.abs(t.kcal - (t.protein * 4 + t.carbs * 4 + t.fat * 9))).toBeLessThanOrEqual(2)
    expect(calculateTargets({ ...client, sex: 'female' }).ree).toBe(t.ree - 166)
  })
  it('同一客户的减脂、维持、增肌方向一致', () => {
    const cut = calculateTargets(client), maintenance = calculateTargets({ ...client, goal: 'maintain' }), gain = calculateTargets({ ...client, goal: 'gain' })
    expect(cut.kcal).toBeLessThan(maintenance.kcal)
    expect(gain.kcal).toBeGreaterThan(maintenance.kcal)
    expect(cut.protein).toBeGreaterThan(gain.protein)
  })
  it.each([
    { age: 17 }, { age: 25.5 }, { age: 66 }, { weight: NaN }, { height: Infinity },
    { weight: 35 }, { weight: 150 }, { generalAdult: false }, { activity: 'missing' },
    { goal: 'toString' }, { excluded: ['milk', 'milk'] }, { excluded: ['unknown'] }
  ])('不对不适用或损坏的资料自动出方案 %j', change => {
    expect(() => calculateTargets({ ...client, ...change } as PlanInput)).toThrow()
  })
  it('超出产品热量边界时明确失败，不偷偷改写目标', () => {
    expect(() => calculateTargets({ ...client, sex: 'female', age: 65, weight: 47, height: 155, activity: 'low' })).toThrow('自动生成范围')
  })
})

describe('菜单生成与真实合计', () => {
  it('食物克数、生熟状态、每餐合计和全日合计一致', () => {
    const plan = generateDailyPlan(client, '2026-10-28')
    expect(plan.matched).toBe(true)
    expect(plan.actual).toEqual(planNutrition(plan.items))
    expect(new Set(plan.items.map(x => x.meal)).size).toBe(4)
    expect(plan.items.every(x => x.grams >= x.min && x.grams <= x.max && x.food.state)).toBe(true)
    const produce = plan.items.filter(x => ['蔬菜', '水果'].includes(x.food.category)).reduce((s, x) => s + x.grams, 0)
    expect(produce).toBeGreaterThanOrEqual(400)
    expect(plan.items.some(x => x.food.name === '橄榄油')).toBe(true)
  })
  it('可重复还原同日计划，换搭配有效且不会改写输入', () => {
    const input = JSON.parse(JSON.stringify(client))
    const p = generateDailyPlan(input, '2026-10-28')
    expect(generateDailyPlan(input, '2026-10-28')).toEqual(p)
    expect(generateDailyPlan(input, '2026-10-28', 1).items).not.toEqual(p.items)
    p.input.excluded.push('milk')
    expect(input).toEqual(client)
    expect(() => generateDailyPlan(input, '2026-02-30')).toThrow()
  })
  it('食物排除与素食偏好在所有菜单中生效', () => {
    const excluded = { ...client, excluded: ['milk', 'egg', 'nuts', 'fish', 'gluten'] as PlanInput['excluded'] }
    const plan = generateDailyPlan(excluded, '2026-10-28')
    expect(plan.items.every(x => allowedFood(x.food, excluded))).toBe(true)
    expect(plan.items.some(x => ['牛奶', '酸奶', '鸡蛋', '燕麦', '杏仁', '鳕鱼'].some(n => x.food.name.includes(n)))).toBe(false)
    const vegan = { ...client, diet: 'vegan' as const }
    expect(generateDailyPlan(vegan, '2026-10-28').items.every(x => allowedFood(x.food, vegan))).toBe(true)
    expect(allowedFood(foods.find(x => x.name === '鸡胸肉')!, vegan)).toBe(false)
    expect(allowedFood(foods.find(x => x.name === '希腊酸奶')!, vegan)).toBe(false)
    expect(() => generateDailyPlan({ ...vegan, excluded: ['soy'] }, '2026-10-28')).toThrow('选择过少')
  })
  it('常见男女体型、三种目标及活动水平的菜单达到明确的误差标准', () => {
    for (const person of [client, { ...client, sex: 'female' as const, age: 30, height: 165, weight: 60 }]) {
      for (const goal of ['lose', 'maintain', 'gain'] as const) {
        for (const activity of activityLevels) {
          const p = generateDailyPlan({ ...person, goal, activity: activity.key }, '2026-10-28')
          expect(p.matched, `${person.sex}/${goal}/${activity.key}: ${JSON.stringify(p.actual)} vs ${JSON.stringify(p.targets)}`).toBe(true)
        }
      }
    }
  })
})

describe('已有数据兼容', () => {
  it('旧版记录无需迁移；保存和还原计划不会写入实际饮食', () => {
    let raw: unknown = JSON.stringify(blankSnapshot())
    const r = createRepository({ get: () => raw, set: (_key, v) => { raw = v } })
    expect(validSnapshot(r.read())).toBe(true)
    const data = r.read()
    data.planner = { ruleVersion: 1, date: '2026-10-28', variant: 0, input: client }
    r.write(data)
    const reloaded = r.read()
    expect(reloaded.planner).toEqual(data.planner)
    expect(reloaded.meals).toEqual([])
    expect(reloaded.profile.targets).toEqual({})
    expect(validSnapshot({ ...data, planner: { ...data.planner, ruleVersion: 2 } })).toBe(false)
  })
})
