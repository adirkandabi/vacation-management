import { http } from './http'
import type { UserDto } from './types'

export async function getMyUser(): Promise<UserDto> {
  // Server RBAC allows requester to fetch only self, validator can fetch anyone.
  // We rely on X-User-Id header to point to "self".
  const res = await http.get<UserDto[]>('/api/users')
  return res.data[0]
}

