const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')

export type Role = 'ADMIN' | 'HR' | 'EMPLOYEE'
export type User = { id: string; email: string; role: Role; employee?: Employee | null }
export type Employee = { id: string; employeeId: string; fullName: string; email: string; phone?: string | null; designation: string; joiningDate: string; salary: number | string; status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'; department?: { id: string; name: string } | null; departmentId?: string | null }
let token = localStorage.getItem('ems_token')
export const authToken = () => token
export const setAuthToken = (value: string | null) => { token = value; if (value) localStorage.setItem('ems_token', value); else localStorage.removeItem('ems_token') }
async function request<T>(path: string, init: RequestInit = {}): Promise<T> { const headers = new Headers(init.headers); headers.set('Content-Type', 'application/json'); if (token) headers.set('Authorization', `Bearer ${token}`); const response = await fetch(`${API_URL}${path}`, { ...init, headers }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.message || 'Request failed'); return data as T }
export const api = {
  login: (email: string, password: string) => request<{ token: string; user: User }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, role: Role = 'EMPLOYEE') => request<{ token: string; user: User }>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, role }) }),
  me: () => request<User>('/api/me'), dashboard: () => request<{ employees: number; present: number; onLeave: number; monthlyPayroll: number | string; departments: { id: string; name: string; _count: { employees: number } }[] }>('/api/dashboard'),
  employees: (q = '') => request<Employee[]>(`/api/employees${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  createEmployee: (data: Record<string, unknown>) => request<Employee>('/api/employees', { method: 'POST', body: JSON.stringify(data) }), updateEmployee: (id: string, data: Record<string, unknown>) => request<Employee>(`/api/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) }), deleteEmployee: (id: string) => request<void>(`/api/employees/${id}`, { method: 'DELETE' }),
  departments: () => request<unknown[]>('/api/departments'), attendance: (employeeId = '') => request<unknown[]>(`/api/attendance${employeeId ? `?employeeId=${employeeId}` : ''}`), checkIn: () => request<unknown>('/api/attendance/check-in', { method: 'POST', body: '{}' }), checkOut: () => request<unknown>('/api/attendance/check-out', { method: 'POST', body: '{}' }),
  leaves: () => request<unknown[]>('/api/leaves'), createLeave: (data: Record<string, unknown>) => request<unknown>('/api/leaves', { method: 'POST', body: JSON.stringify(data) }), reviewLeave: (id: string, status: string) => request<unknown>(`/api/leaves/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  payroll: () => request<unknown[]>('/api/payroll'), processPayroll: (period: string) => request<unknown[]>('/api/payroll/process', { method: 'POST', body: JSON.stringify({ period }) }), performance: () => request<unknown[]>('/api/performance'),
}
