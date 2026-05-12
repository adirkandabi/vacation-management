import { computed, ref } from 'vue'
import type { VacationRequestDto, UserDto } from '../api/types'
import { setUserIdHeader } from '../api/http'
import { createVacationRequest, deleteVacationRequest, listMyVacationRequests } from '../api/vacationRequests'
import { getMyUser } from '../api/users'

function toMessage(e: any, fallback: string): string {
  return e?.response?.data?.error || e?.message || fallback
}

export function useRequester() {
  const me = ref<UserDto | null>(null)
  const requests = ref<VacationRequestDto[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const startDate = ref('')
  const endDate = ref('')
  const reason = ref('')

  const canSubmit = computed(() => startDate.value !== '' && endDate.value !== '' && !!me.value)

  async function refresh(userId: number | null) {
    // This app uses a global axios header; always re-apply identity on entry/refresh.
    setUserIdHeader(userId)

    if (!userId) {
      me.value = null
      requests.value = []
      return
    }

    loading.value = true
    error.value = null
    try {
      me.value = await getMyUser()
      requests.value = await listMyVacationRequests()
    } catch (e: any) {
      error.value = toMessage(e, 'Failed to load data')
    } finally {
      loading.value = false
    }
  }

  async function submit() {
    if (!me.value || !canSubmit.value) return
    loading.value = true
    error.value = null
    try {
      await createVacationRequest({
        userId: me.value.id,
        startDate: startDate.value,
        endDate: endDate.value,
        reason: reason.value.trim() || undefined,
      })
      startDate.value = ''
      endDate.value = ''
      reason.value = ''
    } catch (e: any) {
      error.value = toMessage(e, 'Failed to create request')
    } finally {
      loading.value = false
    }
  }

  async function removeRequest(r: VacationRequestDto, confirmFn: (msg: string) => boolean = confirm) {
    if (r.status !== 'Pending') return
    const ok = confirmFn('Delete this pending request?')
    if (!ok) return

    loading.value = true
    error.value = null
    try {
      await deleteVacationRequest(r.id)
    } catch (e: any) {
      error.value = toMessage(e, 'Failed to delete request')
    } finally {
      loading.value = false
    }
  }

  function statusBadgeClass(status: VacationRequestDto['status']) {
    if (status === 'Approved') return 'badge badge-approved'
    if (status === 'Rejected') return 'badge badge-rejected'
    return 'badge badge-pending'
  }

  return {
    me,
    requests,
    loading,
    error,
    startDate,
    endDate,
    reason,
    canSubmit,
    refresh,
    submit,
    removeRequest,
    statusBadgeClass,
  }
}

