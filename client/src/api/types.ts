export type UserRole = 'Requester' | 'Validator'

export type VacationRequestStatus = 'Pending' | 'Approved' | 'Rejected'

export interface UserDto {
  id: number
  name: string
  role: UserRole
}

export interface VacationRequestDto {
  id: number
  userId: number
  startDate: string
  endDate: string
  reason: string | null
  status: VacationRequestStatus
  comments: string | null
  createdAt: string
  user?: UserDto
}

