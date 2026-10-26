import { afterEach, describe, expect, it, vi } from 'vitest'
import { chooseImage } from '../src/services/photos'

afterEach(() => vi.unstubAllGlobals())

describe('照片选择结果', () => {
  it('用户取消选择时正常返回，不把取消显示成失败', async () => {
    vi.stubGlobal('uni', { chooseImage: ({ fail }: any) => fail({ errMsg: 'chooseImage:fail cancel' }) })
    await expect(chooseImage()).resolves.toBeUndefined()
  })

  it('相册权限失败时返回可理解的反馈', async () => {
    vi.stubGlobal('uni', { chooseImage: ({ fail }: any) => fail({ errMsg: 'chooseImage:fail auth deny' }) })
    await expect(chooseImage()).rejects.toThrow('无法打开相册，请检查权限')
  })
})
