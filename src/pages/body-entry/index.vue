<script setup lang="ts">
import { ref,reactive,computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppPage from '../../components/AppPage.vue'
import Icon from '../../components/Icon.vue'
import { useHealthStore,newId } from '../../stores/health'
import { dateKey } from '../../domain/dates'
import { bmi } from '../../domain/nutrition'
import { back,confirm,display,numeric,toast } from '../../utils/ui'
const store=useHealthStore(),id=ref(''),date=ref(dateKey()),error=ref('')
const form=reactive({weight:'',waist:'',bodyFat:''})
const fields=[{key:'weight' as const,label:'体重',unit:'kg',hint:'建议起床后、如厕后、空腹测量',placeholder:'例如 72.4'},{key:'waist' as const,label:'腰围',unit:'cm',hint:'保持自然呼吸，在固定位置测量',placeholder:'例如 82'},{key:'bodyFat' as const,label:'体脂率',unit:'%',hint:'选填；尽量使用相同设备与测量条件',placeholder:'例如 18.5'}]
const bmiValue=computed(()=>bmi(Number(form.weight)||undefined,store.data.profile.height))
onLoad(q=>{store.hydrate();if(q?.date)date.value=q.date;const entry=q?.id?store.data.bodies.find(x=>x.id===q.id):store.data.bodies.find(x=>x.date===date.value);if(q?.id&&!entry){toast('这条记录已不存在');back();return}if(entry){id.value=entry.id;date.value=entry.date;for(const f of fields)form[f.key]=entry[f.key]?.toString()||''}})
async function save(){error.value='';try{const entry={id:id.value||newId(),date:date.value,weight:numeric(form.weight,'体重',20,350),waist:numeric(form.waist,'腰围',30,250),bodyFat:numeric(form.bodyFat,'体脂率',1,75)};if(![entry.weight,entry.waist,entry.bodyFat].some(x=>x!==undefined))throw new Error('至少填写一项身体数据');const existing=store.data.bodies.find(x=>x.date===date.value&&x.id!==id.value);if(existing&&!await confirm('当天已有身体记录','保存会替换当天的体重、腰围和体脂数据，未填写的项目也会清空。'))return;if(store.saveBody(entry)){back();toast('身体记录已保存')}}catch(e){error.value=(e as Error).message}}
async function remove(){if(await confirm('删除这次身体记录？','当天填写的体重、腰围和体脂将一起删除。')&&store.deleteBody(id.value)){back();toast('记录已删除')}}
</script>
<template><AppPage :title="id?'编辑身体记录':'记录身体'"><text class="eyebrow">A CHECK-IN WITH YOURSELF</text><text class="page-title">记下此刻的自己</text><text class="page-description">记录是为了了解自己，不是评判自己。</text><view class="field mt-24"><text class="field-label">记录日期</text><picker mode="date" :value="date" :end="dateKey()" @change="date=$event.detail.value"><view class="input-wrap row-between"><view class="row gap-8"><Icon name="calendar" :size="18"/><text>{{ date }}</text></view><Icon name="arrow" tone="muted" :size="14"/></view></picker></view><view v-for="f in fields" :key="f.key" class="field"><text class="field-label">{{ f.label }}</text><view class="input-wrap body-value-input"><input :aria-label="f.label" v-model="form[f.key]" type="digit" :placeholder="f.placeholder"/><text class="input-unit">{{ f.unit }}</text></view><text class="helper mt-16">{{ f.hint }}</text></view><view class="card bmi-card row-between"><view><text class="field-label">BMI 辅助参考</text><text class="helper">{{ store.data.profile.height?'由本次体重与已保存身高计算':'设置身高后可计算，仅供辅助参考' }}</text></view><text class="bmi-number number">{{ display(bmiValue,1) }}</text></view><view class="notice mt-16"><Icon name="info" :size="18"/><text>至少填写一项即可。同一日期保留一条身体记录，体脂率不根据 BMI 推算。</text></view><text v-if="error" class="error-message">{{ error }}</text><view class="save-bar"><button role="button" class="btn-primary" @click="save"><Icon name="check" tone="white" :size="18"/>保存身体记录</button><button role="button" v-if="id" class="remove-record danger-link" @click="remove">删除这次记录</button></view></AppPage></template>
<style scoped>.body-value-input{min-height:65px}.body-value-input input{font-size:25px;font-weight:550;height:38px}.bmi-card .field-label{margin-bottom:4px}.bmi-number{font-size:29px;font-weight:600;color:var(--green)}.remove-record{padding-top:18px;width:100%}</style>
