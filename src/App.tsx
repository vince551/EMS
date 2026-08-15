import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowUpRight, BarChart3, Bell, Building2, CalendarDays, CheckCircle2, ChevronRight, Clock3, DollarSign, Download, LayoutDashboard, Menu, Moon, MoreHorizontal, Search, Settings, ShieldCheck, Sparkles, Sun, UserPlus, Users, X } from 'lucide-react'
import { toast } from 'sonner'

type Page = 'dashboard' | 'employees' | 'departments' | 'attendance' | 'leave' | 'payroll' | 'performance' | 'reports'
type Employee = { id: string; name: string; email: string; department: string; title: string; salary: number; status: 'Active' | 'On Leave' }

const seedEmployees: Employee[] = [
  { id: 'EMP-001', name: 'Amina Wanjiku', email: 'amina@acme.co.ke', department: 'Engineering', title: 'Senior Software Engineer', salary: 185000, status: 'Active' },
  { id: 'EMP-002', name: 'Brian Otieno', email: 'brian@acme.co.ke', department: 'Sales', title: 'Sales Manager', salary: 145000, status: 'Active' },
  { id: 'EMP-003', name: 'Faith Njeri', email: 'faith@acme.co.ke', department: 'Human Resources', title: 'HR Specialist', salary: 120000, status: 'Active' },
  { id: 'EMP-004', name: 'David Kamau', email: 'david@acme.co.ke', department: 'Design', title: 'Product Designer', salary: 110000, status: 'On Leave' },
  { id: 'EMP-005', name: 'Lilian Achieng', email: 'lilian@acme.co.ke', department: 'Finance', title: 'Accountant', salary: 135000, status: 'Active' },
  { id: 'EMP-006', name: 'Kevin Mwangi', email: 'kevin@acme.co.ke', department: 'Engineering', title: 'Frontend Developer', salary: 128000, status: 'Active' },
]

const money = (value: number) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value)
const initials = (name: string) => name.split(' ').map(x => x[0]).join('').slice(0, 2)

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [employees, setEmployees] = useState(seedEmployees)
  const [dark, setDark] = useState(false)
  const [sidebar, setSidebar] = useState(false)
  const [search, setSearch] = useState('')
  const [clock, setClock] = useState(new Date())

  useEffect(() => { const timer = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(timer) }, [])

  const present = employees.filter(e => e.status === 'Active').length
  const payroll = employees.reduce((sum, e) => sum + e.salary, 0)
  const filtered = useMemo(() => employees.filter(e => `${e.name} ${e.email} ${e.department} ${e.title}`.toLowerCase().includes(search.toLowerCase())), [employees, search])

  const nav = [
    ['dashboard', 'Dashboard', LayoutDashboard], ['employees', 'Employees', Users], ['departments', 'Departments', Building2],
    ['attendance', 'Attendance', Clock3], ['leave', 'Leave', CalendarDays], ['payroll', 'Payroll', DollarSign],
    ['performance', 'Performance', ShieldCheck], ['reports', 'Reports', BarChart3],
  ] as const
  const pageTitle = nav.find(([id]) => id === page)?.[1] ?? 'Dashboard'

  const go = (next: Page) => { setPage(next); setSidebar(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return <div className={dark ? 'app dark' : 'app'}>
    <aside className={`sidebar ${sidebar ? 'open' : ''}`}>
      <div className="brand"><div className="brand-icon">E</div><div><strong>EMS</strong><span>Enterprise HR</span></div><button className="mobile-close" onClick={() => setSidebar(false)}><X size={20}/></button></div>
      <div className="workspace"><span className="workspace-dot"/> <span className="workspace-name">Acme Corporation</span><ChevronRight size={14}/></div>
      <nav>{nav.map(([id, label, Icon]) => <button key={id} className={page === id ? 'active' : ''} onClick={() => go(id)}><Icon size={18}/><span>{label}</span>{id === 'leave' && <b className="nav-badge">3</b>}</button>)}</nav>
      <div className="sidebar-bottom"><button><Settings size={18}/> Settings</button><button onClick={() => setDark(!dark)}>{dark ? <Sun size={18}/> : <Moon size={18}/>} {dark ? 'Light mode' : 'Dark mode'}</button><div className="profile"><div className="avatar">VO</div><div><strong>Vincent Odhiambo</strong><span>Administrator</span></div><MoreHorizontal size={16}/></div></div>
    </aside>

    <main className="main">
      <header className="topbar"><button className="menu" onClick={() => setSidebar(true)}><Menu/></button><div><p className="crumb">Workspace <ChevronRight size={10}/> {pageTitle}</p><h2>{pageTitle}</h2></div><div className="top-actions"><div className="live-time"><span className="live-dot"/> {clock.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</div><div className="search"><Search size={17}/><input placeholder="Search anything…" value={search} onChange={e => setSearch(e.target.value)}/><kbd>⌘ K</kbd></div><button className="icon-btn"><Bell size={19}/><i/></button><div className="mini-avatar">VO</div></div></header>

      {page === 'dashboard' && <Dashboard employees={employees} present={present} payroll={payroll} onPage={go}/>} 
      {page === 'employees' && <Employees employees={filtered} search={search} setSearch={setSearch} onAdd={() => { const id = `EMP-${String(employees.length + 1).padStart(3, '0')}`; setEmployees([...employees, { id, name: 'New Employee', email: 'new@acme.co.ke', department: 'Engineering', title: 'Software Engineer', salary: 95000, status: 'Active' }]); toast.success('Employee added to your workspace') }}/>} 
      {page === 'departments' && <Departments employees={employees}/>} 
      {page === 'attendance' && <SimplePage icon={<Clock3/>} eyebrow="TIME & ATTENDANCE" title="Attendance" text="Real-time workforce attendance, hours and overtime tracking." action="Clock in"/>}
      {page === 'leave' && <SimplePage icon={<CalendarDays/>} eyebrow="TIME OFF" title="Leave management" text="Review leave balances, applications and approval workflows." action="Apply for leave"/>}
      {page === 'payroll' && <Payroll employees={employees}/>} 
      {page === 'performance' && <SimplePage icon={<ShieldCheck/>} eyebrow="PEOPLE GROWTH" title="Performance" text="Reviews, goals, feedback and performance analytics." action="New review"/>}
      {page === 'reports' && <SimplePage icon={<BarChart3/>} eyebrow="BUSINESS INTELLIGENCE" title="Reports & analytics" text="Enterprise workforce insights and downloadable HR reports." action="Export report"/>}
    </main>
  </div>
}

function Dashboard({ employees, present, payroll, onPage }: { employees: Employee[]; present: number; payroll: number; onPage: (p: Page) => void }) {
  const departments = [...new Set(employees.map(e => e.department))]
  const attendance = Math.round(present / employees.length * 100)
  const firstName = 'Vincent'
  return <section className="content dashboard-content">
    <div className="hero premium-hero"><div><div className="eyebrow-row"><span className="eyebrow">WORKFORCE OVERVIEW</span><span className="live-pill"><Activity size={12}/> LIVE</span></div><h1>Good afternoon, {firstName}.</h1><p>Your organization is running smoothly. Here’s your workforce snapshot.</p></div><div className="hero-actions"><button className="ghost" onClick={() => toast('Quick actions coming next')}>Quick actions</button><button className="primary" onClick={() => onPage('employees')}><UserPlus size={16}/> Add employee</button></div></div>
    <div className="stats-grid">{[
      [Users,'Total employees',employees.length,'+8.4%','vs last month'],
      [CheckCircle2,'Present today',present,`${attendance}%`,'attendance rate'],
      [CalendarDays,'On leave',employees.length-present,'3','pending approvals'],
      [DollarSign,'Monthly payroll',money(payroll),'+5.2%','estimated gross'],
    ].map(([Icon,label,value,metric,sub], i) => <article className="stat premium-stat" key={i}><div className="stat-top"><div className="stat-icon"><Icon size={19}/></div><span className="stat-trend"><ArrowUpRight size={12}/> {metric as string}</span></div><span>{label as string}</span><strong>{value as string}</strong><small>{sub as string}</small></article>)}</div>
    <div className="dashboard-grid top-panels">
      <article className="panel chart-panel"><div className="panel-head"><div><h3>Department distribution</h3><p>Current workforce by team</p></div><button onClick={() => onPage('reports')}>View report <ArrowUpRight size={13}/></button></div>{departments.map(dept => { const count = employees.filter(e => e.department === dept).length; return <div className="bar-row" key={dept}><div><span>{dept}</span><b>{count} people</b></div><div className="bar"><i style={{width: `${count/employees.length*100}%`}}/></div></div> })}</article>
      <article className="panel pulse-panel"><div className="panel-head"><div><h3>Workforce pulse</h3><p>Today at a glance</p></div><Sparkles size={18} className="spark"/></div><div className="pulse-ring"><div><strong>{attendance}%</strong><span>attendance</span></div></div><div className="pulse-metrics"><span><b>{present}</b> Present</span><span><b>{employees.length-present}</b> Away</span><span><b>2</b> Late</span></div></article>
    </div>
    <div className="dashboard-grid bottom-panels">
      <article className="panel"><div className="panel-head"><div><h3>Recent activity</h3><p>Latest HR events across your workspace</p></div><button>View all <ChevronRight size={13}/></button></div>{['Payroll cycle processed','David Kamau submitted leave','New employee added','Performance review completed'].map((x,i) => <div className="activity" key={x}><div className={`activity-icon a${i}`}><Bell size={15}/></div><div><strong>{x}</strong><span>{i+1} hour{i ? 's' : ''} ago</span></div><MoreHorizontal size={15}/></div>)}</article>
      <article className="panel quick-panel"><div className="panel-head"><div><h3>Pending actions</h3><p>Items that need your attention</p></div><span className="count-badge">4</span></div><button onClick={() => onPage('leave')}><span className="quick-icon orange"><CalendarDays size={16}/></span><span><strong>Leave requests</strong><small>3 requests awaiting review</small></span><ChevronRight size={15}/></button><button onClick={() => onPage('performance')}><span className="quick-icon purple"><ShieldCheck size={16}/></span><span><strong>Performance reviews</strong><small>1 review due this week</small></span><ChevronRight size={15}/></button></article>
    </div>
  </section>
}

function Employees({ employees, search, setSearch, onAdd }: { employees: Employee[]; search: string; setSearch: (s:string)=>void; onAdd:()=>void }) { return <section className="content"><div className="section-head"><div><span className="eyebrow">PEOPLE</span><h1>Employees</h1><p>Manage your workforce and employee records.</p></div><button className="primary" onClick={onAdd}><UserPlus size={16}/> Add employee</button></div><div className="toolbar"><div className="search wide"><Search size={17}/><input placeholder="Search employees…" value={search} onChange={e=>setSearch(e.target.value)}/></div><select><option>All departments</option></select><select><option>All statuses</option></select></div><div className="employee-grid">{employees.map(e=><article className="employee-card" key={e.id}><div className="employee-top"><div className="avatar large">{initials(e.name)}</div><span className={e.status==='Active'?'status active':'status leave'}>{e.status}</span></div><h3>{e.name}</h3><p>{e.title}</p><div className="employee-meta"><span>◈ {e.id}</span><span>⌂ {e.department}</span><span>✉ {e.email}</span></div><div className="employee-footer"><strong>{money(e.salary)}<small>/ month</small></strong><button>View profile →</button></div></article>)}</div></section> }

function Departments({ employees }: { employees: Employee[] }) { const ds=[...new Set(employees.map(e=>e.department))]; return <section className="content"><div className="section-head"><div><span className="eyebrow">ORGANIZATION</span><h1>Departments</h1><p>Manage teams, managers and budgets.</p></div><button className="primary" onClick={()=>toast.success('Department creation opened')}><Building2 size={16}/> New department</button></div><div className="dept-grid">{ds.map(d=><article className="panel dept-card" key={d}><div className="dept-icon"><Building2/></div><h3>{d}</h3><p>{employees.filter(e=>e.department===d).length} employees</p><div className="dept-line"><span>Department manager</span><strong>Assigned manager</strong></div><div className="dept-line"><span>Annual budget</span><strong>KSh 2.4M</strong></div></article>)}</div></section> }

function Payroll({ employees }: { employees: Employee[] }) { const total=employees.reduce((a,e)=>a+e.salary,0); return <section className="content"><div className="section-head"><div><span className="eyebrow">FINANCE</span><h1>Payroll</h1><p>Process salaries, deductions and payslips securely.</p></div><div className="hero-actions"><button className="ghost" onClick={()=>toast.success('Payroll report prepared')}><Download size={15}/> Export</button><button className="primary" onClick={()=>toast.success('Payroll processed successfully')}><DollarSign size={15}/> Process payroll</button></div></div><div className="stats-grid compact"><article className="stat"><span>Gross payroll</span><strong>{money(total)}</strong><small>Current month</small></article><article className="stat"><span>Allowances</span><strong>{money(total*.08)}</strong><small>Estimated</small></article><article className="stat"><span>Deductions</span><strong>{money(total*.18)}</strong><small>PAYE + statutory</small></article><article className="stat"><span>Net payroll</span><strong>{money(total*.82)}</strong><small>Estimated</small></article></div><article className="panel table-panel"><div className="panel-head"><div><h3>Salary register</h3><p>August 2026 · All employees</p></div><button>Export CSV <Download size={13}/></button></div><div className="table-scroll"><table><thead><tr><th>Employee</th><th>Department</th><th>Basic salary</th><th>Deductions</th><th>Net salary</th><th>Status</th></tr></thead><tbody>{employees.map(e=><tr key={e.id}><td><strong>{e.name}</strong><span>{e.id}</span></td><td>{e.department}</td><td>{money(e.salary)}</td><td>{money(e.salary*.18)}</td><td><strong>{money(e.salary*.82)}</strong></td><td><span className="status active">Processed</span></td></tr>)}</tbody></table></div></article></section> }

function SimplePage({ icon, eyebrow, title, text, action }: {icon: React.ReactNode; eyebrow:string; title:string; text:string; action:string}) { return <section className="content"><div className="empty-page"><div className="empty-icon">{icon}</div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p><button className="primary" onClick={()=>toast.success(`${action} action opened`)}>{action}</button><div className="coming-soon"><Sparkles size={13}/> Module ready for the next build phase</div></div></section> }
