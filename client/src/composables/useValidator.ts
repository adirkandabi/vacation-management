import { computed, ref } from 'vue'
import type { VacationRequestDto, VacationRequestStatus } from '../api/types'
import { approveVacationRequest, listAllVacationRequests, rejectVacationRequest } from '../api/vacationRequests'

function toMessage(e: any, fallback: string): string {
  return e?.response?.data?.error || e?.message || fallback
}

export function useValidator() {
  const filterStatus = ref<VacationRequestStatus | 'All'>('All')
  const requests = ref<VacationRequestDto[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const rejectId = ref<number | null>(null)
  const rejectComment = ref('')

  const filteredLabel = computed(() => (filterStatus.value === 'All' ? 'All statuses' : filterStatus.value))

  function statusBadgeClass(status: VacationRequestDto['status']) {
    if (status === 'Approved') return 'badge badge-approved'
    if (status === 'Rejected') return 'badge badge-rejected'
    return 'badge badge-pending'
  }

  async function refresh() {
    loading.value = true
    error.value = null
    try {
      const status = filterStatus.value === 'All' ? undefined : filterStatus.value
      requests.value = await listAllVacationRequests({ status })
    } catch (e: any) {
      error.value = toMessage(e, 'Failed to load requests')
    } finally {
      loading.value = false
    }
  }

  async function approve(r: VacationRequestDto) {
    if (r.status !== 'Pending') return
    loading.value = true
    error.value = null
    try {
      await approveVacationRequest(r.id)
    } catch (e: any) {
      error.value = toMessage(e, 'Failed to approve')
    } finally {
      loading.value = false
    }
  }

  function openReject(r: VacationRequestDto) {
    rejectId.value = r.id
    rejectComment.value = ''
  }

  function cancelReject() {
    rejectId.value = null
    rejectComment.value = ''
  }

  async function confirmReject() {
    if (!rejectId.value) return
    const comment = rejectComment.value.trim()
    if (!comment) {
      error.value = 'Comment is required when rejecting'
      return
    }

    loading.value = true
    error.value = null
    try {
      await rejectVacationRequest(rejectId.value, comment)
      cancelReject()
    } catch (e: any) {
      error.value = toMessage(e, 'Failed to reject')
    } finally {
      loading.value = false
    }
  }

  return {
    filterStatus,
    requests,
    loading,
    error,
    rejectId,
    rejectComment,
    filteredLabel,
    statusBadgeClass,
    refresh,
    approve,
    openReject,
    cancelReject,
    confirmReject,
  }
}

