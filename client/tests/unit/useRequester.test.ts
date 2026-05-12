import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

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
    updateVacationRequest: vi.fn(),
  }
})

import { setUserIdHeader } from '../../src/api/http'
import { getMyUser } from '../../src/api/users'
import {
  createVacationRequest,
  deleteVacationRequest,
  listMyVacationRequests,
  updateVacationRequest,
} from '../../src/api/vacationRequests'
import { useRequester } from '../../src/composables/useRequester'

describe('useRequester', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
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
    ;(getMyUser as any).mockResolvedValue({ id: 2, name: 'R2', role: 'Requester' })
    ;(listMyVacationRequests as any).mockResolvedValue([])

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
    expect(listMyVacationRequests).toHaveBeenCalled()
  })

  it('submit() does not call API when start is in the past', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00'))

    const r = useRequester()
    r.me.value = { id: 2, name: 'R2', role: 'Requester' } as any
    r.startDate.value = '2026-06-14'
    r.endDate.value = '2026-06-20'

    await r.submit()

    expect(createVacationRequest).not.toHaveBeenCalled()
    expect(r.error.value).toBe('Start date cannot be in the past')
  })

  it('saveEdit() patches and refreshes', async () => {
    ;(getMyUser as any).mockResolvedValue({ id: 2, name: 'R2', role: 'Requester' })
    ;(listMyVacationRequests as any).mockResolvedValue([])
    ;(updateVacationRequest as any).mockResolvedValue({ id: 9 })

    const r = useRequester()
    await r.refresh(2)
    r.beginEdit({
      id: 9,
      userId: 2,
      startDate: '2030-03-01',
      endDate: '2030-03-05',
      reason: 'old',
      status: 'Pending',
      comments: null,
      createdAt: '2030-01-01T00:00:00.000Z',
    } as any)
    r.editStart.value = '2030-04-01'
    r.editEnd.value = '2030-04-02'
    r.editReason.value = ''

    await r.saveEdit()

    expect(updateVacationRequest).toHaveBeenCalledWith(9, {
      startDate: '2030-04-01',
      endDate: '2030-04-02',
      reason: null,
    })
    expect(r.editingId.value).toBeNull()
  })

  it('removeRequest() does nothing for non-pending', async () => {
    const r = useRequester()
    const confirmFn = vi.fn(() => true)
    await r.removeRequest({ id: 5, status: 'Approved' } as any, confirmFn)
    expect(confirmFn).not.toHaveBeenCalled()
    expect(deleteVacationRequest).not.toHaveBeenCalled()
  })
})

