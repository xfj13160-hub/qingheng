<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppPage from '../../components/AppPage.vue'
import Icon from '../../components/Icon.vue'
import { useHealthStore } from '../../stores/health'
import { dateKey } from '../../domain/dates'
import { mealKeys, mealNames } from '../../domain/types'
import { activityLevels, dietStyles, exclusions, generateDailyPlan, planGoals, planNutrition, planSources } from '../../domain/mealPlan'
import type { DailyPlan, Exclusion, PlanInput } from '../../domain/mealPlan'
import { confirm, numeric, toast } from '../../utils/ui'

const store = useHealthStore(), error = ref(''), plan = ref<DailyPlan>(), variant = ref(0), showSources = ref(false), saved = ref(false)
const form = reactive({ clientName: '', age: '', sex: '' as '' | PlanInput['sex'], height: '', weight: '', activity: '' as '' | PlanInput['activity'], goal: 'lose' as PlanInput['goal'], diet: 'mixed' as PlanInput['diet'], excluded: [] as Exclusion[], generalAdult: false, date: dateKey() })
const nutrientFields = [{ key: 'kcal' as const, label: '热量', unit: 'kcal' }, { key: 'protein' as const, label: '蛋白质', unit: 'g' }, { key: 'carbs' as const, label: '碳水', unit: 'g' }, { key: 'fat' as const, label: '脂肪', unit: 'g' }]
const activityLabel = computed(() => activityLevels.find(x => x.key === form.activity)?.label || '请选择全天活动水平')
const meals = computed(() => plan.value ? mealKeys.map(key => { const items = plan.value!.items.filter(x => x.meal === key); return { key, name: mealNames[key], items, actual: planNutrition(items) } }) : [])
watch(form, () => { plan.value = undefined; saved.value = false; error.value = ''; variant.value = 0 }, { deep: true, flush: 'sync' })
onLoad(() => {
  store.hydrate()
  const previous = store.data.planner
  if (previous) {
    Object.assign(form, previous.input, { age: String(previous.input.age), height: String(previous.input.height), weight: String(previous.input.weight), excluded: [...previous.input.excluded], date: previous.date })
    variant.value = previous.variant
    try { plan.value = generateDailyPlan(previous.input, previous.date, previous.variant); saved.value = true } catch (e) { error.value = (e as Error).message }
  } else {
    // Only reuse explicitly known profile data. Age, formula sex and activity are never guessed.
    form.clientName = store.data.profile.name
    form.height = store.data.profile.height?.toString() || ''
    form.goal = store.data.profile.goal === '增肌塑形' ? 'gain' : store.data.profile.goal === '维持健康' ? 'maintain' : 'lose'
  }
})
function toggleExclude(key: Exclusion) { form.excluded = form.excluded.includes(key) ? form.excluded.filter(x => x !== key) : [...form.excluded, key] }
function changeActivity(event: { detail: { value: string | number } }) { form.activity = activityLevels[Number(event.detail.value)].key }
function input(): PlanInput {
  if (!form.sex) throw new Error('请选择估算公式使用的性别参数。')
  if (!form.activity) throw new Error('请选择全天活动水平，包含工作、步行和训练。')
  return { clientName: form.clientName.trim(), age: numeric(form.age, '年龄', 19, 65, true)!, height: numeric(form.height, '身高', 130, 220, true)!, weight: numeric(form.weight, '当前体重', 35, 180, true)!, sex: form.sex, activity: form.activity, goal: form.goal, diet: form.diet, excluded: [...form.excluded], generalAdult: form.generalAdult }
}
function generate(change = false) {
  plan.value = undefined; error.value = ''; saved.value = false
  try {
    const next = change ? (variant.value + 1) % 10000 : 0
    plan.value = generateDailyPlan(input(), form.date, next)
    variant.value = next
  } catch (e) { error.value = (e as Error).message }
}
function save() {
  if (!plan.value) return
  if (store.savePlanner({ ruleVersion: 1, date: plan.value.date, variant: variant.value, input: plan.value.input })) { saved.value = true; toast('计划已保存在本机') }
}
async function applyTargets() {
  const current = plan.value
  if (!current) return
  if (await confirm('设为本机每日营养目标？', `${current.input.clientName || '这位客户'}：${current.targets.kcal} kcal，蛋白质 ${current.targets.protein} g，碳水 ${current.targets.carbs} g，脂肪 ${current.targets.fat} g。将覆盖本机当前目标，已有饮食记录保持原样。`)) {
    // Keep the reviewed values even if form state changes while the confirmation is open.
    const { kcal, protein, carbs, fat } = current.targets
    if (store.saveProfile({ ...store.data.profile, targets: { kcal, protein, carbs, fat } })) toast('每日营养目标已更新')
  }
}
function copyPlan() {
  const p = plan.value
  if (!p) return
  const lines = [`轻衡 · ${p.input.clientName || '客户'} · ${p.date}`, `${planGoals[p.input.goal]}｜${p.input.age} 岁｜${p.input.height} cm｜${p.input.weight} kg`, `参考目标：${p.targets.kcal} kcal；蛋白质 ${p.targets.protein} g；碳水 ${p.targets.carbs} g；脂肪 ${p.targets.fat} g`, `菜单合计：${Math.round(p.actual.kcal)} kcal；蛋白质 ${p.actual.protein.toFixed(1)} g；碳水 ${p.actual.carbs.toFixed(1)} g；脂肪 ${p.actual.fat.toFixed(1)} g`, p.matched ? '菜单接近目标（热量/蛋白质±10%，碳水/脂肪±20%）' : '当前菜单未达到匹配标准，请调整后使用。']
  for (const meal of meals.value) lines.push(`\n${meal.name}：${meal.items.map(x => `${x.food.name} ${x.grams} g（${x.food.state}）`).join('；')}`)
  lines.push('\n所有克数为标注状态下的可食部重量；食用油计入，其他调味料另记。食物为本地参考值，包装标签优先。排除项仅按单一食材筛选，不能替代过敏原及交叉污染核对。', '本计划为健康成人的起始估算。观察 2–3 周七日平均体重、训练表现、饥饿和疲劳，再复核活动与份量，不按单日体重自动加减热量。', '蔬果至少 400 g、天然膳食纤维至少 25 g 为一般目标；当前食物库无法核算纤维和微量营养素是否达标。', '\n计算依据与限制：', ...planSources.map(s => `${s.title}：${s.detail}\n${s.url}`), '活动系数为经验起点；减脂−15%、增肌+5%、脂肪25%及菜单误差容许值是工具设定，不是个体疗效保证。规则 v1。')
  uni.setClipboardData({ data: lines.join('\n'), success: () => toast('已复制计划和依据'), fail: () => toast('复制失败，请检查剪贴板权限') })
}
</script>

<template>
  <AppPage title="每日饮食计划">
    <text class="eyebrow">EAT WITH A DIRECTION</text>
    <text class="page-title">按目标，好好吃每一天</text>
    <text class="page-description">填写客户资料，生成有依据的起始营养目标和一日参考菜单。每个数字都可以追溯计算方式。</text>
    <view class="notice mt-16"><Icon name="info" :size="18"/><text>面向 19–65 岁、无需治疗性饮食的普通健康成人。孕期、哺乳期、肾病、糖尿病或饮食障碍等情况，请由医生或注册营养师制定。</text></view>
    <view class="form-card">
      <view class="form-grid">
        <view class="field"><text class="field-label">客户称呼 · 选填</text><view class="input-wrap"><input v-model="form.clientName" aria-label="客户称呼" placeholder="例如 小徐" maxlength="30"/></view></view>
        <view class="field"><text class="field-label">计划日期</text><picker mode="date" :value="form.date" @change="form.date = $event.detail.value"><view class="input-wrap">{{ form.date }}</view></picker></view>
        <view class="field"><text class="field-label">年龄</text><view class="input-wrap"><input v-model="form.age" aria-label="年龄" type="number" placeholder="19–65"/><text class="input-unit">岁</text></view></view>
        <view class="field"><text class="field-label">当前体重</text><view class="input-wrap"><input v-model="form.weight" aria-label="当前体重" type="digit" placeholder="例如 75"/><text class="input-unit">kg</text></view></view>
        <view class="field"><text class="field-label">身高</text><view class="input-wrap"><input v-model="form.height" aria-label="身高" type="digit" placeholder="例如 175"/><text class="input-unit">cm</text></view></view>
        <view class="field"><text class="field-label">公式性别参数</text><view class="sex-choices"><button v-for="s in [{key:'male' as const,label:'男'},{key:'female' as const,label:'女'}]" :key="s.key" role="button" class="choice" :class="{active:form.sex===s.key}" @click="form.sex=s.key">{{ s.label }}</button></view></view>
      </view>
      <view class="field"><text class="field-label">客户目标</text><view class="choice-group"><button v-for="(label,key) in planGoals" :key="key" role="button" class="choice" :class="{active:form.goal===key}" @click="form.goal=key">{{ label }}</button></view></view>
      <view class="field"><text class="field-label">全天活动水平</text><picker :range="activityLevels" range-key="label" :value="Math.max(0,activityLevels.findIndex(x=>x.key===form.activity))" @change="changeActivity"><view class="input-wrap row-between"><text>{{ activityLabel }}</text><Icon name="arrow" :size="12"/></view></picker><text class="helper">包含工作、日常走动与训练，不再额外叠加运动消耗。运动频率相同，实际消耗也可能不同。</text></view>
      <view class="field"><text class="field-label">饮食偏好</text><view class="choice-group"><button v-for="(label,key) in dietStyles" :key="key" role="button" class="choice" :class="{active:form.diet===key}" @click="form.diet=key">{{ label }}</button></view></view>
      <view class="field"><text class="field-label">不吃的食物组 · 多选</text><view class="choice-group"><button v-for="(label,key) in exclusions" :key="key" role="button" class="choice" :class="{active:form.excluded.includes(key)}" @click="toggleExclude(key)">{{ label }}</button></view><text class="helper">按食材名称筛选；如有食物过敏，还需核对产品配料、过敏原和交叉污染。</text></view>
      <button role="checkbox" :aria-checked="form.generalAdult" class="adult-confirm" @click="form.generalAdult=!form.generalAdult"><view class="check-box" :class="{checked:form.generalAdult}">{{ form.generalAdult?'✓':'' }}</view><text>客户为上述适用范围的普通健康成人</text></button>
      <text v-if="error" class="error-message" role="alert">{{ error }}</text>
      <view v-if="store.storageIssue" class="error-message">{{ store.storageIssue }}</view>
      <button role="button" class="btn-primary generate-button" @click="generate()"><Icon name="leaf" tone="white" :size="18"/>生成每日计划</button>
    </view>

    <view v-if="plan" class="section result" aria-live="polite">
      <view class="section-heading"><view><text class="eyebrow">{{ plan.date }} · {{ plan.input.clientName || '客户' }}</text><text class="section-title">{{ planGoals[plan.input.goal] }} · 每日参考目标</text></view><text class="pill">估算起点</text></view>
      <view class="target-grid"><view v-for="field in nutrientFields" :key="field.key" class="target-tile"><text class="helper">{{ field.label }}</text><text class="target-value number">{{ plan.targets[field.key] }}<text class="target-unit">{{ field.unit }}</text></text></view></view>
      <view class="calculation card mt-16">
        <text class="small-heading">这些数字怎么来的？</text>
        <text class="helper">静息消耗约 {{ Math.round(plan.targets.ree) }} kcal × 活动系数 {{ plan.targets.factor }} = 维持热量约 {{ Math.round(plan.targets.maintenance) }} kcal。</text>
        <text class="helper">{{ plan.input.goal==='lose'?'减脂从维持热量减少 15% 起步':plan.input.goal==='gain'?'增肌从维持热量增加 5% 起步':'维持使用估算的维持热量' }}，目标取整至 10 kcal。</text>
        <text class="helper">蛋白质 {{ plan.targets.proteinPerKg }} g/kg；脂肪约占热量 25%；碳水由剩余热量计算。蛋白质/碳水按 4 kcal/g、脂肪按 9 kcal/g。</text>
        <text class="helper">活动系数、增减幅度和具体配比为工具默认值，需要结合实际反馈调整。</text>
      </view>
      <view class="section-heading mt-24"><text class="section-title">一日参考菜单</text><button role="button" class="text-link" @click="generate(true)">换个搭配<Icon name="arrow" :size="12"/></button></view>
      <text class="helper mb-16">每种食物均标明生熟状态，重量指可食部；食用油已计入，其他调味料需另记。计划不会自动算成已吃的食物。</text>
      <view v-if="!plan.matched" class="error-message">当前偏好下的菜单未达到匹配标准，请调整偏好或交由营养师修改后使用。营养目标与菜单实际合计见下方。</view>
      <view v-for="meal in meals" :key="meal.key" class="meal-card card">
        <view class="row-between"><text class="small-heading">{{ meal.name }}</text><text class="pill">{{ Math.round(meal.actual.kcal) }} kcal</text></view>
        <view v-for="(item,index) in meal.items" :key="index" class="food-row"><view class="grow"><text class="food-name">{{ item.food.name }}</text><text class="helper">{{ item.food.state }}</text></view><text class="food-grams">{{ item.grams }} g</text></view>
        <text class="helper meal-macros">蛋白质 {{ meal.actual.protein.toFixed(1) }} g · 碳水 {{ meal.actual.carbs.toFixed(1) }} g · 脂肪 {{ meal.actual.fat.toFixed(1) }} g</text>
      </view>
      <view class="card mt-16"><text class="small-heading">菜单合计 / 每日目标</text><view v-for="field in nutrientFields" :key="field.key" class="summary-row"><text>{{ field.label }}</text><text>{{ Math.round(plan.actual[field.key]) }} / {{ plan.targets[field.key] }} {{ field.unit }}</text></view><text class="helper">{{ plan.matched?'菜单接近目标':'菜单需调整' }}。匹配标准为热量及蛋白质 ±10%、碳水及脂肪 ±20%，是菜单生成的容许范围，不是医学达标标准。食物库参考热量与 4/4/9 换算也可能略有差异。</text></view>
      <view class="notice mt-16"><Icon name="chart" :size="19"/><text>观察 2–3 周七日平均体重、训练表现、饥饿与疲劳，再复核活动和份量。不要按单日体重自动减餐。增肌还需要规律的抗阻训练。</text></view>
      <text class="helper mt-16">蔬果至少 400 g、天然膳食纤维至少 25 g 为一般参考目标。本食物库尚不能核算纤维、钙、铁等是否充足，参考菜单不等于全面营养评估。</text>
      <view class="action-row mt-16"><button role="button" class="btn-primary" :disabled="!!store.storageIssue" @click="save">{{ saved?'已保存到本机':'保存这份计划' }}</button><button role="button" class="btn-secondary" @click="copyPlan">复制完整计划</button></view>
      <button role="button" class="btn-secondary mt-16 full-width" :disabled="!!store.storageIssue" @click="applyTargets">设为本机每日营养目标</button>
      <text class="helper mt-16">本机保留最近一份客户计划；保存新计划会替换旧计划。客户计划与本机实际饮食记录独立，暂不提供多人账号或云同步。</text>
    </view>
    <view class="section sources"><button role="button" class="source-toggle row-between" @click="showSources=!showSources"><text class="section-title">科学依据与适用边界</text><text>{{ showSources?'收起':'展开' }}</text></button><view v-if="showSources"><view v-for="source in planSources" :key="source.url" class="source-item"><text class="small-heading">{{ source.title }}</text><text class="helper">{{ source.detail }}</text><text class="source-url" selectable>{{ source.url }}</text></view><text class="helper">静息消耗公式：10 × kg + 6.25 × cm − 5 × 年龄 + 性别项（男 +5，女 −161）。公式不能覆盖个体代谢差异。</text><text class="helper">本工具仅自动生成 BMI 18.5–29.9、估算摄入男 ≥1500 / 女 ≥1200 且 ≤4000 kcal 的方案；这些是产品适用边界，不代表普适安全阈值。体型特殊或高训练量人群需单独评估。规则 v1。</text></view></view>
  </AppPage>
</template>

<style scoped>
.sex-choices{display:flex;gap:8px}.sex-choices .choice{flex:1;padding:13px 8px}.adult-confirm{display:flex;align-items:flex-start;text-align:left;gap:10px;font-size:12px;line-height:1.8;width:100%;padding:4px 0 16px}.check-box{width:21px;height:21px;flex-shrink:0;border:1px solid #8ca980;border-radius:6px;text-align:center;color:white;line-height:20px}.check-box.checked{background:var(--green)}.generate-button{width:100%;margin-top:5px}.target-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.target-tile{background:#e7eedf;border:1px solid #dce5d1;border-radius:15px;padding:16px}.target-value{display:block;font-size:28px;font-weight:650;margin-top:6px}.target-unit{font-size:11px;margin-left:5px;font-weight:400;letter-spacing:0}.small-heading{display:block;font-size:14px;font-weight:600;line-height:1.7}.calculation .helper{margin-top:9px}.meal-card{margin-top:12px}.food-row{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-top:13px}.food-name{display:block;font-size:13px}.food-grams{font-size:13px;font-weight:600;white-space:nowrap}.meal-macros{border-top:1px solid var(--line);padding-top:11px;margin-top:14px}.summary-row{display:flex;justify-content:space-between;gap:12px;font-size:12px;margin:13px 0}.full-width{width:100%}.source-toggle{width:100%;font-size:12px;gap:12px;justify-content:space-between;color:var(--green)}.source-item{padding:17px 0;border-bottom:1px solid var(--line)}.source-item .helper{margin-top:6px}.source-url{display:block;font-size:10px;line-height:1.8;color:var(--green);overflow-wrap:anywhere;word-break:break-all;margin-top:8px}.sources>.uni-view>.helper{margin-top:12px}.result>.section-heading{gap:8px}.result .pill{flex-shrink:0}.sources{padding-bottom:10px}
</style>
