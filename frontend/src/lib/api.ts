const BASE = '/api'

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('cb_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'API error')
  }
  return res.json() as Promise<T>
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiFetch<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  demoAccounts: () => apiFetch<any[]>('/auth/demo-accounts'),

  // Clinical
  patients: () => apiFetch<any[]>('/clinical/patients'),
  registerPatient: (data: any) =>
    apiFetch<any>('/clinical/patients', { method: 'POST', body: JSON.stringify(data) }),
  submitCase: (data: any) =>
    apiFetch<any>('/clinical/cases', { method: 'POST', body: JSON.stringify(data) }),
  cases: () => apiFetch<any[]>('/clinical/cases'),
  triageEvaluate: (data: any) =>
    apiFetch<any>('/clinical/triage-evaluate', { method: 'POST', body: JSON.stringify(data) }),
  specialists: (dept?: string) =>
    apiFetch<any[]>(`/clinical/specialists${dept ? `?dept=${dept}` : ''}`),
  createReferral: (data: any) =>
    apiFetch<any>('/clinical/referrals', { method: 'POST', body: JSON.stringify(data) }),
  referrals: (specialistId?: string) =>
    apiFetch<any[]>(`/clinical/referrals${specialistId ? `?specialist_id=${specialistId}` : ''}`),
  submitReview: (data: any) =>
    apiFetch<any>('/clinical/specialist-review', { method: 'POST', body: JSON.stringify(data) }),

  // Medicine
  verifyMedicine: (query: string, role = 'public') =>
    apiFetch<any>('/medicine/verify', { method: 'POST', body: JSON.stringify({ query, scanned_by_role: role }) }),
  medicineBatches: () => apiFetch<any[]>('/medicine/batches'),
  registerBatch: (data: any) =>
    apiFetch<any>('/medicine/register-batch', { method: 'POST', body: JSON.stringify(data) }),
  suspiciousReports: () => apiFetch<any[]>('/medicine/suspicious-reports'),

  // Hospital
  hospitalLayout: (floor?: number) =>
    apiFetch<any>(`/hospital/layout${floor !== undefined ? `?floor=${floor}` : ''}`),
  navigate: (source: string, target: string, accessible = false) =>
    apiFetch<any>('/hospital/navigate', { method: 'POST', body: JSON.stringify({ source_node: source, target_node: target, accessible_only: accessible }) }),
  queueDepartments: () => apiFetch<any[]>('/hospital/queue/departments'),
  generateToken: (data: any) =>
    apiFetch<any>('/hospital/queue/token', { method: 'POST', body: JSON.stringify(data) }),
  patientJourney: (patientId: string) =>
    apiFetch<any>(`/hospital/journey/${patientId}`),

  // Analytics
  adminMetrics: () => apiFetch<any>('/analytics/metrics'),

  // Assistant
  assistant: (message: string, language: string) =>
    apiFetch<any>('/assistant/query', { method: 'POST', body: JSON.stringify({ message, language }) }),
}

