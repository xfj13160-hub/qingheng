import { describe,it,expect } from 'vitest'
import { dateKey,isDate,parseDate,shiftDate,weekStart } from '../src/domain/dates'
import { averageWeight,bmi,metricRecords,portion,total,weeklySummary,advice } from '../src/domain/nutrition'
import { blankSnapshot } from '../src/services/repository'
import { foods } from '../src/data/foods'
import type { BodyEntry,MealEntry } from '../src/domain/types'
const meal = (date:string,grams=100):MealEntry=>({id:date,date,meal:'lunch',foodId:'food-1',name:'米饭',grams,per100:{kcal:116,protein:2.6,carbs:25.9,fat:.3},art:'oats'})
describe('本地日期与范围',()=>{
  it('跨月、跨年以及闰年不漂移',()=>{expect(shiftDate('2026-01-01',-1)).toBe('2025-12-31');expect(shiftDate('2024-02-28',1)).toBe('2024-02-29');expect(weekStart('2026-10-25')).toBe('2026-10-19');expect(dateKey(parseDate('2026-10-26'))).toBe('2026-10-26')})
  it('拒绝无效日历日期',()=>{expect(isDate('2026-02-30')).toBe(false);expect(isDate('2024-02-29')).toBe(true);expect(isDate('2026-2-01')).toBe(false)})
})
describe('营养与身体计算',()=>{
  it('内置60种食物，按实际克数缩放并累计小数',()=>{expect(foods).toHaveLength(60);const n=portion(foods[0],150);expect(n.kcal).toBe(174);expect(n.protein).toBeCloseTo(3.9);expect(total([meal('2026-10-26',150),meal('2026-10-26',50)]).kcal).toBe(232)})
  it('BMI、均重只使用有效的已记录数据，排除未来与窗口外记录',()=>{const bodies:BodyEntry[]=[{id:'a',date:'2026-10-19',weight:99},{id:'b',date:'2026-10-20',weight:73},{id:'c',date:'2026-10-24',waist:82},{id:'d',date:'2026-10-26',weight:72},{id:'e',date:'2026-10-27',weight:60}];expect(averageWeight(bodies,'2026-10-26')).toBe(72.5);expect(metricRecords(bodies,'waist','2026-10-26',7)).toHaveLength(1);expect(bmi(72,180)).toBeCloseTo(22.222);expect(bmi(72,undefined)).toBeUndefined();expect(averageWeight([],'2026-10-26')).toBeUndefined()})
})
describe('周回顾与解释性建议',()=>{
  it('不把缺失记录日作为0摄入，按当前目标汇总',()=>{const d=blankSnapshot();d.profile.targets={kcal:232,protein:5};d.meals=[meal('2026-10-26',200),meal('2026-10-28',100),meal('2026-10-25',900)];d.training=[{id:'t',date:'2026-10-27',type:'力量训练',minutes:45,feeling:'状态不错',note:''}];d.bodies=[{id:'b1',date:'2026-10-26',weight:72.4},{id:'b2',date:'2026-10-30',weight:72}];const s=weeklySummary(d,'2026-10-28');expect(s.days).toBe(2);expect(s.averageKcal).toBe(174);expect(s.energyDays).toBe(1);expect(s.proteinDays).toBe(1);expect(s.minutes).toBe(45);expect(s.weightChange).toBeCloseTo(-.4)})
  it('空数据不产生身体变化或虚构的营养不足判断',()=>{const d=blankSnapshot();d.profile.targets={kcal:2100,protein:140};expect(weeklySummary(d,'2026-10-26').averageKcal).toBeUndefined();expect(weeklySummary(d,'2026-10-26').weightChange).toBeUndefined();expect(advice(d,'2026-10-26').title).toContain('从一餐开始');d.meals=[meal('2026-10-26')];expect(advice(d,'2026-10-26').detail).toContain('未记录的餐食不会计入')})
})
