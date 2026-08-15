import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role, EmployeeStatus, LeaveStatus } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me-in-production';

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL?.split(',') ?? true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const tokenFor = (user: { id: string; role: Role; email: string }) =>
  jwt.sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '8h' });

type AuthRequest = Request & { user?: { id: string; role: Role; email: string } };
const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required' });
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { sub: string; role: Role; email: string };
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch { return res.status(401).json({ message: 'Invalid or expired token' }); }
};
const roles = (...allowed: Role[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !allowed.includes(req.user.role)) return res.status(403).json({ message: 'Insufficient permissions' });
  next();
};
const asyncRoute = (fn: (req: AuthRequest, res: Response) => Promise<unknown>) => (req: AuthRequest, res: Response, next: NextFunction) => Promise.resolve(fn(req,res)).catch(next);

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'ems-api', timestamp: new Date().toISOString() }));

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const body = z.object({ email:z.string().email(), password:z.string().min(8), role:z.nativeEnum(Role).default(Role.EMPLOYEE) }).parse(req.body);
  const exists = await prisma.user.findUnique({ where:{ email:body.email } });
  if (exists) return res.status(409).json({ message:'Email already registered' });
  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await prisma.user.create({ data:{ email:body.email, passwordHash, role:body.role } });
  return res.status(201).json({ token:tokenFor(user), user:{ id:user.id,email:user.email,role:user.role } });
}));

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const body = z.object({ email:z.string().email(), password:z.string() }).parse(req.body);
  const user = await prisma.user.findUnique({ where:{ email:body.email } });
  if (!user || !(await bcrypt.compare(body.password,user.passwordHash))) return res.status(401).json({ message:'Invalid email or password' });
  return res.json({ token:tokenFor(user), user:{ id:user.id,email:user.email,role:user.role } });
}));

app.get('/api/me', auth, asyncRoute(async (req,res) => {
  const user = await prisma.user.findUnique({ where:{ id:req.user!.id }, include:{ employee:true } });
  return res.json(user ? { id:user.id,email:user.email,role:user.role,employee:user.employee } : null);
}));

app.get('/api/employees', auth, asyncRoute(async (req,res) => {
  const q = String(req.query.q ?? '');
  const employees = await prisma.employee.findMany({ where:q ? { OR:[{fullName:{contains:q,mode:'insensitive'}},{employeeId:{contains:q,mode:'insensitive'}},{email:{contains:q,mode:'insensitive'}}] } : undefined, include:{department:true}, orderBy:{createdAt:'desc'} });
  return res.json(employees);
}));

app.post('/api/employees', auth, roles(Role.ADMIN,Role.HR), asyncRoute(async (req,res) => {
  const body = z.object({ employeeId:z.string(),fullName:z.string().min(2),email:z.string().email(),phone:z.string().optional(),designation:z.string(),joiningDate:z.coerce.date(),salary:z.coerce.number().nonnegative(),departmentId:z.string().optional() }).parse(req.body);
  const employee = await prisma.employee.create({ data:{ ...body, salary:body.salary, status:EmployeeStatus.ACTIVE } });
  return res.status(201).json(employee);
}));

app.patch('/api/employees/:id', auth, roles(Role.ADMIN,Role.HR), asyncRoute(async (req,res) => {
  const body = z.object({ fullName:z.string().min(2).optional(),phone:z.string().optional(),designation:z.string().optional(),salary:z.coerce.number().nonnegative().optional(),status:z.nativeEnum(EmployeeStatus).optional(),departmentId:z.string().nullable().optional() }).parse(req.body);
  return res.json(await prisma.employee.update({ where:{id:req.params.id}, data:body }));
}));

app.delete('/api/employees/:id', auth, roles(Role.ADMIN), asyncRoute(async (req,res) => { await prisma.employee.delete({where:{id:req.params.id}}); return res.status(204).send(); }));

app.get('/api/departments', auth, asyncRoute(async (_req,res) => res.json(await prisma.department.findMany({include:{_count:{select:{employees:true}}},orderBy:{name:'asc'}}))));
app.post('/api/departments', auth, roles(Role.ADMIN,Role.HR), asyncRoute(async (req,res) => { const b=z.object({name:z.string().min(2),manager:z.string().optional(),budget:z.coerce.number().nonnegative()}).parse(req.body); return res.status(201).json(await prisma.department.create({data:b})); }));
app.patch('/api/departments/:id', auth, roles(Role.ADMIN,Role.HR), asyncRoute(async (req,res) => { const b=z.object({name:z.string().min(2).optional(),manager:z.string().optional(),budget:z.coerce.number().nonnegative().optional()}).parse(req.body); return res.json(await prisma.department.update({where:{id:req.params.id},data:b})); }));
app.delete('/api/departments/:id', auth, roles(Role.ADMIN), asyncRoute(async (req,res) => { await prisma.department.delete({where:{id:req.params.id}}); return res.status(204).send(); }));

app.get('/api/attendance', auth, asyncRoute(async (req,res) => { const employeeId=String(req.query.employeeId||''); return res.json(await prisma.attendance.findMany({where:employeeId?{employeeId}:undefined,include:{employee:true},orderBy:{date:'desc'},take:100})); }));
app.post('/api/attendance/check-in', auth, asyncRoute(async (req,res) => { const e=await prisma.employee.findUnique({where:{userId:req.user!.id}}); if(!e) return res.status(404).json({message:'Employee profile not linked'}); const date=new Date(); date.setHours(0,0,0,0); const record=await prisma.attendance.upsert({where:{employeeId_date:{employeeId:e.id,date}},create:{employeeId:e.id,date,checkIn:new Date(),status:'PRESENT'},update:{checkIn:new Date(),status:'PRESENT'}}); return res.json(record); }));
app.post('/api/attendance/check-out', auth, asyncRoute(async (req,res) => { const e=await prisma.employee.findUnique({where:{userId:req.user!.id}}); if(!e) return res.status(404).json({message:'Employee profile not linked'}); const date=new Date(); date.setHours(0,0,0,0); const record=await prisma.attendance.findUnique({where:{employeeId_date:{employeeId:e.id,date}}}); if(!record?.checkIn) return res.status(400).json({message:'Check in first'}); const out=new Date(); const hours=(out.getTime()-record.checkIn.getTime())/3600000; return res.json(await prisma.attendance.update({where:{id:record.id},data:{checkOut:out,hours}})); }));

app.get('/api/leaves', auth, asyncRoute(async (req,res) => { return res.json(await prisma.leaveRequest.findMany({include:{employee:true},orderBy:{createdAt:'desc'}})); }));
app.post('/api/leaves', auth, asyncRoute(async (req,res) => { const e=await prisma.employee.findUnique({where:{userId:req.user!.id}}); const employeeId=String(req.body.employeeId||e?.id||''); if(!employeeId) return res.status(400).json({message:'Employee required'}); const b=z.object({type:z.enum(['CASUAL','SICK','PAID','UNPAID']),startDate:z.coerce.date(),endDate:z.coerce.date(),reason:z.string().min(2)}).parse(req.body); const days=Math.max(1,Math.ceil((b.endDate.getTime()-b.startDate.getTime())/86400000)+1); return res.status(201).json(await prisma.leaveRequest.create({data:{...b,employeeId,days}})); }));
app.patch('/api/leaves/:id', auth, roles(Role.ADMIN,Role.HR), asyncRoute(async (req,res) => { const status=z.nativeEnum(LeaveStatus).parse(req.body.status); return res.json(await prisma.leaveRequest.update({where:{id:req.params.id},data:{status,reviewedAt:new Date()}})); }));

app.get('/api/payroll', auth, roles(Role.ADMIN,Role.HR), asyncRoute(async (req,res) => res.json(await prisma.payroll.findMany({include:{employee:true},orderBy:{period:'desc'}}))));
app.post('/api/payroll/process', auth, roles(Role.ADMIN,Role.HR), asyncRoute(async (req,res) => { const period=String(req.body.period || new Date().toISOString().slice(0,7)); const employees=await prisma.employee.findMany({where:{status:EmployeeStatus.ACTIVE}}); const rows=await prisma.$transaction(employees.map(e=>{const basic=Number(e.salary);const allowances=Number(req.body.allowances||0);const bonuses=Number(req.body.bonuses||0);const deductions=Number(req.body.deductions||0);const tax=(basic+allowances+bonuses)*0.1;const net=basic+allowances+bonuses-deductions-tax;return prisma.payroll.upsert({where:{employeeId_period:{employeeId:e.id,period}},create:{employeeId:e.id,period,basic,allowances,bonuses,deductions,tax,net,processedAt:new Date()},update:{basic,allowances,bonuses,deductions,tax,net,processedAt:new Date()}});})); return res.json(rows); }));

app.get('/api/performance', auth, asyncRoute(async (_req,res) => res.json(await prisma.performanceReview.findMany({include:{employee:true},orderBy:{createdAt:'desc'}}))));
app.post('/api/performance', auth, roles(Role.ADMIN,Role.HR), asyncRoute(async (req,res) => { const b=z.object({employeeId:z.string(),reviewer:z.string(),rating:z.number().int().min(1).max(5),goal:z.string(),feedback:z.string()}).parse(req.body); return res.status(201).json(await prisma.performanceReview.create({data:b})); }));

app.get('/api/dashboard', auth, asyncRoute(async (_req,res) => { const [employees,present,onLeave,payroll,departments]=await Promise.all([prisma.employee.count({where:{status:EmployeeStatus.ACTIVE}}),prisma.attendance.count({where:{date:{gte:new Date(new Date().setHours(0,0,0,0))},status:'PRESENT'}}),prisma.leaveRequest.count({where:{status:LeaveStatus.APPROVED,startDate:{lte:new Date()},endDate:{gte:new Date()}}}),prisma.payroll.aggregate({_sum:{net:true}}),prisma.department.findMany({include:{_count:{select:{employees:true}}}})]); return res.json({employees,present,onLeave,monthlyPayroll:payroll._sum.net??0,departments}); }));

app.use((_req,res)=>res.status(404).json({message:'Route not found'}));
app.use((err:unknown,_req:Request,res:Response,_next:NextFunction)=>{ console.error(err); if(err instanceof z.ZodError) return res.status(400).json({message:'Validation error',issues:err.issues}); return res.status(500).json({message:'Internal server error'}); });

app.listen(PORT,()=>console.log(`EMS API running on http://localhost:${PORT}`));
process.on('SIGINT',async()=>{await prisma.$disconnect();process.exit(0)});
