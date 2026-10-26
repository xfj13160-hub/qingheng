export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type Metric = 'weight' | 'waist' | 'bodyFat'
export interface Nutrition { kcal: number; protein: number; carbs: number; fat: number }
export interface Food extends Nutrition { id: string; name: string; state: string; category: string; art: string; custom?: boolean }
export interface MealEntry { id: string; date: string; meal: Meal; foodId: string; name: string; grams: number; per100: Nutrition; photo?: string; art: string }
export interface BodyEntry { id: string; date: string; weight?: number; waist?: number; bodyFat?: number }
export interface TrainingEntry { id: string; date: string; type: string; minutes: number; feeling: string; note: string }
export interface Profile { name: string; goal: string; height?: number; targetWeight?: number; targets: Partial<Nutrition> }
export interface Snapshot { version: 1; onboarded: boolean; profile: Profile; meals: MealEntry[]; bodies: BodyEntry[]; training: TrainingEntry[]; customFoods: Food[]; favorites: string[] }
export const mealNames: Record<Meal, string> = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' }
export const mealKeys: Meal[] = ['breakfast', 'lunch', 'dinner', 'snack']
export const metricNames: Record<Metric, string> = { weight: '体重', waist: '腰围', bodyFat: '体脂' }
export const metricUnits: Record<Metric, string> = { weight: 'kg', waist: 'cm', bodyFat: '%' }
export const trainingTypes = ['力量训练', '跑步', '快走', '骑行', '游泳', '瑜伽拉伸', '球类运动', '其他训练']
export const feelings = ['轻松完成', '状态不错', '有点吃力', '需要休息']
