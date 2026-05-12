import { computed, ref } from 'vue'
import { http, setUserIdHeader } from '../api/http'
import type { UserDto } from '../api/types'

const STORAGE_KEY = 'vacation-validator-user-id'

const validatorId = ref<number | null>(null)
const validatorUser = ref<UserDto | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

function readCachedId(): number | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

async function tryResolveAsValidator(candidateId: number): Promise<UserDto | null> {
  // For this demo, the server identifies the acting user via X-User-Id.
  // We probe a small id range until we find the seeded Validator.
  setUserIdHeader(candidateId)
  const res = await http.get<UserDto[]>('/api/users')
  const data = res.data
  const self = data.find((u) => u.id === candidateId)
  if (self?.role !== 'Validator') return null
  return self
}

export async function ensureValidatorUser(): Promise<void> {
  // If we already resolved the validator before, still re-apply the global header.
  if (validatorUser.value) {
    setUserIdHeader(validatorId.value)
    return
  }
  loading.value = true
  error.value = null

  try {
    const cached = readCachedId()
    if (cached) {
      const u = await tryResolveAsValidator(cached)
      if (u) {
        validatorId.value = cached
        validatorUser.value = u
        localStorage.setItem(STORAGE_KEY, String(cached))
        setUserIdHeader(cached)
        return
      }
      localStorage.removeItem(STORAGE_KEY)
    }

    // Default seed usually gives small ids; probe first 25.
    for (let id = 1; id <= 25; id++) {
      const u = await tryResolveAsValidator(id)
      if (u) {
        validatorId.value = id
        validatorUser.value = u
        localStorage.setItem(STORAGE_KEY, String(id))
        setUserIdHeader(id)
        return
      }
    }

    throw new Error('Could not auto-detect validator user id. Reset DB / seed and retry.')
  } catch (e: any) {
    error.value = e?.message || 'Failed to resolve validator user'
    setUserIdHeader(null)
  } finally {
    loading.value = false
  }
}

export function useValidatorUser() {
  return {
    validatorId,
    validatorUser,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    ready: computed(() => !!validatorUser.value),
  }
}

