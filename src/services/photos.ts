// H5 保存 Blob 到 IndexedDB；微信使用 saveFile，避免保存临时图片路径。
// #ifdef H5
let database: Promise<IDBDatabase> | undefined
const urlCache = new Map<string,string>()
function db(): Promise<IDBDatabase> { return database ||= new Promise((resolve, reject) => { const request = indexedDB.open('qingheng-photos', 1); request.onupgradeneeded = () => request.result.createObjectStore('photos'); request.onsuccess = () => resolve(request.result); request.onerror = () => { database = undefined; reject(request.error) } }) }
async function photoTransaction<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> { const database = await db(); return new Promise((resolve, reject) => { const tx = database.transaction('photos', mode); const req = action(tx.objectStore('photos')); tx.oncomplete = () => resolve(req.result); tx.onabort = () => reject(tx.error || req.error); tx.onerror = () => reject(tx.error || req.error) }) }
// #endif
export function chooseImage(): Promise<string | undefined> { return new Promise((resolve, reject) => uni.chooseImage({ count: 1, sizeType: ['compressed'], success: result => resolve(result.tempFilePaths[0]), fail: error => /cancel/i.test(error.errMsg) ? resolve(undefined) : reject(new Error('无法打开相册，请检查权限。')) })) }
export async function persistPhoto(path: string): Promise<string> {
  // #ifdef H5
  const response = await fetch(path); const blob = await response.blob()
  if (blob.size > 8 * 1024 * 1024) throw new Error('照片超过8MB，请选择较小的图片。')
  const key = `idb:${Date.now()}-${Math.random().toString(36).slice(2)}`
  await photoTransaction('readwrite', store => store.put(blob, key)); return key
  // #endif
  // #ifndef H5
  return new Promise((resolve, reject) => uni.saveFile({ tempFilePath: path, success: r => resolve(r.savedFilePath), fail: () => reject(new Error('照片保存失败，请检查设备存储空间。')) }))
  // #endif
}
export async function resolvePhoto(reference: string): Promise<string> {
  // #ifdef H5
  if (reference.startsWith('idb:')) { if (urlCache.has(reference)) return urlCache.get(reference)!; const blob = await photoTransaction('readonly', store => store.get(reference)); if (!(blob instanceof Blob)) throw new Error('照片已不可用'); const url = URL.createObjectURL(blob); urlCache.set(reference, url); return url }
  // #endif
  return reference
}
export async function removePhoto(reference?: string): Promise<void> {
  if (!reference) return
  try {
    // #ifdef H5
    if (reference.startsWith('idb:')) { const cached = urlCache.get(reference); if (cached) URL.revokeObjectURL(cached); urlCache.delete(reference); await photoTransaction('readwrite', store => store.delete(reference)) }
    // #endif
    // #ifndef H5
    await new Promise<void>((resolve, reject) => uni.removeSavedFile({ filePath: reference, success: () => resolve(), fail: reject }))
    // #endif
  } catch { /* 附件清理失败不回滚已提交的记录。 */ }
}
