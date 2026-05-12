import { computed, ref } from 'vue'
import type { VacationRequestDto, UserDto } from '../api/types'
import { setUserIdHeader } from '../api/http'
import {
  createVacationRequest,
  deleteVacationRequest,
  listMyVacationRequests,
  updateVacationRequest,
} from '../api/vacationRequests'
import { getMyUser } from '../api/users'
import { getTodayYmdLocal, rangeNotInPastMessage } from '../utils/dateMin'

function toMessage(e: any, fallback: string): string {
  return e?.response?.data?.error || e?.message || fallback
}

export function useRequester() {
  const me = ref<UserDto | null>(null)
  const requests = ref<VacationRequestDto[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUserId = ref<number | null>(null)

  const startDate = ref('')
  const endDate = ref('')
  const reason = ref('')

  const editingId = ref<number | null>(null)
  const editStart = ref('')
  const editEnd = ref('')
  const editReason = ref('')

  const canSubmit = computed(() => startDate.value !== '' && endDate.value !== '' && !!me.value)

  const minYmd = computed(() => getTodayYmdLocal())
  const newEndMin = computed(() => {
    const t = minYmd.value
    if (startDate.value && startDate.value >= t) {
      return startDate.value
    }
    return t
  })
  const editEndMin = computed(() => {
    const t = minYmd.value
    if (editStart.value && editStart.value >= t) {
      return editStart.value
    }
    return t
  })

  async function refresh(userId: number | null) {
    lastUserId.value = userId
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
    const bad = rangeNotInPastMessage(startDate.value, endDate.value)
    if (bad) {
      error.value = bad
      return
    }
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
      await refresh(me.value.id)
    } catch (e: any) {
      error.value = toMessage(e, 'Failed to create request')
    } finally {
      loading.value = false
    }
  }

  function beginEdit(r: VacationRequestDto) {
    if (r.status !== 'Pending') return
    editingId.value = r.id
    editStart.value = r.startDate
    editEnd.value = r.endDate
    editReason.value = r.reason ?? ''
  }

  function cancelEdit() {
    editingId.value = null
    editStart.value = ''
    editEnd.value = ''
    editReason.value = ''
  }

  async function saveEdit() {
    if (!editingId.value) return
    if (!editStart.value || !editEnd.value) {
      error.value = 'Start and end dates are required'
      return
    }
    const bad = rangeNotInPastMessage(editStart.value, editEnd.value)
    if (bad) {
      error.value = bad
      return
    }
    loading.value = true
    error.value = null
    try {
      await updateVacationRequest(editingId.value, {
        startDate: editStart.value,
        endDate: editEnd.value,
        reason: editReason.value.trim() === '' ? null : editReason.value.trim(),
      })
      cancelEdit()
      await refresh(lastUserId.value ?? me.value?.id ?? null)
    } catch (e: any) {
      error.value = toMessage(e, 'Failed to update request')
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
    editingId,
    editStart,
    editEnd,
    editReason,
    minYmd,
    newEndMin,
    editEndMin,
    refresh,
    submit,
    beginEdit,
    cancelEdit,
    saveEdit,
    removeRequest,
    statusBadgeClass,
  }
}

