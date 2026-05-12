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

  it('approve calls API then refreshes list', async () => {
    ;(approveVacationRequest as any).mockResolvedValue({ id: 1, status: 'Approved' })
    ;(listAllVacationRequests as any).mockResolvedValue([{ id: 1, status: 'Approved' }])

    const v = useValidator()
    v.filterStatus.value = 'All'
    await v.approve({ id: 1, status: 'Pending' } as any)

    expect(approveVacationRequest).toHaveBeenCalledWith(1)
    expect(listAllVacationRequests).toHaveBeenCalled()
  })

  it('confirmReject calls API then refreshes list', async () => {
    ;(rejectVacationRequest as any).mockResolvedValue({ id: 2, status: 'Rejected' })
    ;(listAllVacationRequests as any).mockResolvedValue([])

    const v = useValidator()
    v.rejectId.value = 2
    v.rejectComment.value = 'No coverage'
    await v.confirmReject()

    expect(rejectVacationRequest).toHaveBeenCalledWith(2, 'No coverage')
    expect(listAllVacationRequests).toHaveBeenCalled()
  })
})

