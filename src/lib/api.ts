const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export type ApiUser = { id:string; email:string; role:'ADMIN'|'HR'|'EMPLOYEE' }
export type Employee = { id:string; employeeId:string; fullName:string; email:string; phone?:string|null; designation:string; joiningDate:string; salary:number|string; status:string; departmentId?:string|null; department?:{id:string;name:string}|null }

async function request<T>(path:string, options:RequestInit={}) : Promise<T> {
  const token = localStorage.getItem('ems_token')
  const response = await fetch(`${API_URL}${path}`, { ...options, headers:{'Content-Type':'application/json', ...(token ? {Authorization:`Bearer ${token}`} : {}), ...(options.headers ?? {})} })
  if (!response.ok) { const body = await response.json().catch(()=>({})); throw new Error(body.message ?? `Request failed (${response.status})`) }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  health:()=>request<{ok:boolean}>('/health'),
  login:(email:string,password:string)=>request<{token:string;user:ApiUser}>('/auth/login',{method:'POST',body:JSON.stringify({email,password})}),
  register:(data:{email:string;password:string;role:'ADMIN'|'HR'|'EMPLOYEE'})=>request<{token:string;user:ApiUser}>('/auth/register',{method:'POST',body:JSON.stringify(data)}),
  me:()=>request('/me'),
  dashboard:()=>request('/dashboard'),
  employees:(q='')=>request<Employee[]>(`/employees${q?`?q=${encodeURIComponent(q)}`:''}`),
  createEmployee:(data:unknown)=>request<Employee>('/employees',{method:'POST',body:JSON.stringify(data)}),
  updateEmployee:(id:string,data:unknown)=>request<Employee>(`/employees/${id}`,{method:'PATCH',body:JSON.stringify(data)}),
  deleteEmployee:(id:string)=>request<void>(`/employees/${id}`,{method:'DELETE'}),
  departments:()=>request('/departments'),
  attendance:()=>request('/attendance'),
  leaves:()=>request('/leaves'),
  payroll:()=>request('/payroll'),
  performance:()=>request('/performance'),
}
