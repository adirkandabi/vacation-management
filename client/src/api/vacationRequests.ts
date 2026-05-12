import { http } from './http'
import type { VacationRequestDto } from './types'

export async function listMyVacationRequests(): Promise<VacationRequestDto[]> {
  const res = await http.get<VacationRequestDto[]>('/api/vacation-requests')
  return res.data
}

export async function createVacationRequest(input: {
  userId: number
  startDate: string
  endDate: string
  reason?: string
}): Promise<VacationRequestDto> {
  const res = await http.post<VacationRequestDto>('/api/vacation-requests', input)
  return res.data
}

export async function deleteVacationRequest(id: number): Promise<void> {
  await http.delete(`/api/vacation-requests/${id}`)
}

