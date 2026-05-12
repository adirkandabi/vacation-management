import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../../src/api/vacationRequests', () => {
  return {
    listAllVacationRequests: vi.fn(),
    approveVacationRequest: vi.fn(),
    rejectVacationRequest: vi.fn(),
  }
})

import {
  approveVacationRequest,
  listAllVacationRequests,
  rejectVacationRequest,
} from '../../src/api/vacationRequests'
import { useValidator } from '../../src/composables/useValidator'

describe('useValidator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('refresh uses status filter', async () => {
    ;(listAllVacationRequests as any).mockResolvedValue([{ id: 1 }])

    const v = useValidator()
    v.filterStatus.value = 'Pending'
    await v.refresh()

    expect(listAllVacationRequests).toHaveBeenCalledWith({ status: 'Pending' })
    expect(v.requests.value.length).toBe(1)
  })

  it('confirmReject requires non-empty comment', async () => {
    const v = useValidator()
    v.rejectId.value = 10
    v.rejectComment.value = '   '

    await v.confirmReject()

    expect(v.error.value).toMatch(/required/i)
    expect(rejectVacationRequest).not.toHaveBeenCalled()
  })

  it('approve only works on pending', async () => {
    const v = useValidator()
    await v.approve({ id: 1, status: 'Approved' } as any)
    expect(approveVacationRequest).not.toHaveBeenCalled()
  })
})

