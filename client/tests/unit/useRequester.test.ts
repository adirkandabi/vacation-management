import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../../src/api/http', () => {
  return {
    setUserIdHeader: vi.fn(),
  }
})

vi.mock('../../src/api/users', () => {
  return {
    getMyUser: vi.fn(),
  }
})

vi.mock('../../src/api/vacationRequests', () => {
  return {
    listMyVacationRequests: vi.fn(),
    createVacationRequest: vi.fn(),
    deleteVacationRequest: vi.fn(),
  }
})

import { setUserIdHeader } from '../../src/api/http'
import { getMyUser } from '../../src/api/users'
import {
  createVacationRequest,
  deleteVacationRequest,
  listMyVacationRequests,
} from '../../src/api/vacationRequests'
import { useRequester } from '../../src/composables/useRequester'

describe('useRequester', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('refresh(null) clears state and sets header', async () => {
    const r = useRequester()
    r.me.value = { id: 1, name: 'X', role: 'Requester' }
    r.requests.value = [{ id: 1 } as any]

    await r.refresh(null)

    expect(setUserIdHeader).toHaveBeenCalledWith(null)
    expect(r.me.value).toBeNull()
    expect(r.requests.value).toEqual([])
  })

  it('refresh(userId) loads me and requests', async () => {
    ;(getMyUser as any).mockResolvedValue({ id: 2, name: 'R2', role: 'Requester' })
    ;(listMyVacationRequests as any).mockResolvedValue([{ id: 10 }, { id: 11 }])

    const r = useRequester()
    await r.refresh(2)

    expect(setUserIdHeader).toHaveBeenCalledWith(2)
    expect(r.me.value?.id).toBe(2)
    expect(r.requests.value.map((x) => x.id)).toEqual([10, 11])
  })

  it('submit() calls createVacationRequest and clears fields on success', async () => {
    const r = useRequester()
    r.me.value = { id: 2, name: 'R2', role: 'Requester' } as any
    r.startDate.value = '2030-01-01'
    r.endDate.value = '2030-01-02'
    r.reason.value = '  hi  '

    ;(createVacationRequest as any).mockResolvedValue({ id: 1 })

    await r.submit()

    expect(createVacationRequest).toHaveBeenCalledWith({
      userId: 2,
      startDate: '2030-01-01',
      endDate: '2030-01-02',
      reason: 'hi',
    })
    expect(r.startDate.value).toBe('')
    expect(r.endDate.value).toBe('')
    expect(r.reason.value).toBe('')
  })

  it('removeRequest() does nothing for non-pending', async () => {
    const r = useRequester()
    const confirmFn = vi.fn(() => true)
    await r.removeRequest({ id: 5, status: 'Approved' } as any, confirmFn)
    expect(confirmFn).not.toHaveBeenCalled()
    expect(deleteVacationRequest).not.toHaveBeenCalled()
  })
})

