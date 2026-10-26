export const navigate = (page: string, query = '') => uni.navigateTo({ url: `/pages/${page}/index${query ? `?${query}` : ''}` })
export const home = () => uni.reLaunch({ url: '/pages/today/index' })
export const back = () => { const pages = getCurrentPages(); if (pages.length > 1) uni.navigateBack(); else home() }
export const toast = (title: string) => uni.showToast({ title, icon: 'none' })
export function confirm(title: string, content: string): Promise<boolean> { return new Promise(resolve => uni.showModal({ title, content, confirmColor: '#176d3c', success: r => resolve(r.confirm), fail: () => resolve(false) })) }
export const display = (n?: number, digits = 0) => n === undefined ? '—' : n.toFixed(digits)
export function numeric(value: string, label: string, min: number, max: number, required = false): number | undefined { if (!value.trim()) { if (required) throw new Error(`请填写${label}`); return undefined } const n = Number(value); if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${label}应为 ${min}–${max} 之间的数字`); return n }
