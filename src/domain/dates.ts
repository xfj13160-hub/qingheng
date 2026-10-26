export function dateKey(value = new Date()): string { return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}` }
export function parseDate(key: string): Date { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d, 12) }
export function shiftDate(key: string, days: number): string { const date = parseDate(key); date.setDate(date.getDate() + days); return dateKey(date) }
export function isDate(key: unknown): key is string { return typeof key === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(key) && dateKey(parseDate(key)) === key }
export function weekStart(key = dateKey()): string { const day = parseDate(key).getDay(); return shiftDate(key, -(day === 0 ? 6 : day - 1)) }
export function dateLabel(key: string): string { return key === dateKey() ? '今天' : `${parseDate(key).getMonth() + 1}月${parseDate(key).getDate()}日` }
export function shortDate(key: string): string { const d = parseDate(key); return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')}` }
export function weekDays(key = dateKey()): string[] { const start = weekStart(key); return Array.from({ length: 7 }, (_, i) => shiftDate(start, i)) }
