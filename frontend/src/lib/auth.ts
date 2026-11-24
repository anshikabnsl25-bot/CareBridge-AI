export interface AuthUser {
  id: string
  email: string
  role: 'patient' | 'asha_worker' | 'specialist' | 'pharmacist' | 'admin'
  full_name: string
  phone: string
  preferred_language: string
  hospital_id: string
  department_id?: string
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem('cb_user')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function setSession(token: string, user: AuthUser) {
  localStorage.setItem('cb_token', token)
  localStorage.setItem('cb_user', JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem('cb_token')
  localStorage.removeItem('cb_user')
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('cb_token')
}

