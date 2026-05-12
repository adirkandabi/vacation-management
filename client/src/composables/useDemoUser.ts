import { computed, ref, watch } from 'vue'
import { setUserIdHeader } from '../api/http'

const STORAGE_KEY = 'vacation-demo-user-id'

function readInitial(): number | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

const userIdRef = ref<number | null>(readInitial())
setUserIdHeader(userIdRef.value)

watch(userIdRef, (val) => {
  if (val && Number.isFinite(val)) {
    localStorage.setItem(STORAGE_KEY, String(val))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
  setUserIdHeader(val)
})

export function useDemoUser() {
  return {
    userId: userIdRef,
    hasUser: computed(() => typeof userIdRef.value === 'number' && userIdRef.value > 0),
  }
}

