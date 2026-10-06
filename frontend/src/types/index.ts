// Mirrors backend/app/schemas. Keep in sync when the API changes.

export const APPLICATION_STATUSES = [
  'SAVED',
  'APPLIED',
  'OA',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const EMPLOYMENT_TYPES = ['INTERNSHIP', 'CO_OP', 'PART_TIME', 'FULL_TIME'] as const
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number]

export interface User {
  id: number
  email: string
  created_at: string
}

export interface Credentials {
  email: string
  password: string
}

export interface Application {
  id: number
  company: string
  position: string
  location: string | null
  job_url: string | null
  status: ApplicationStatus
  date_applied: string | null
  salary: string | null
  employment_type: EmploymentType | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type ApplicationInput = Omit<Application, 'id' | 'created_at' | 'updated_at'>

export interface ApplicationSummary {
  total: number
  by_status: Record<ApplicationStatus, number>
}
