import { PrismaClient, Role, EmployeeStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('Admin@12345', 12)
  const admin = await prisma.user.upsert({ where:{email:'admin@ems.local'}, update:{}, create:{email:'admin@ems.local',passwordHash,role:Role.ADMIN} })
  const engineering = await prisma.department.upsert({ where:{name:'Engineering'}, update:{}, create:{name:'Engineering',manager:'System Admin',budget:12000000} })
  await prisma.employee.upsert({ where:{employeeId:'EMP-001'}, update:{userId:admin.id}, create:{employeeId:'EMP-001',fullName:'EMS Administrator',email:'admin@ems.local',designation:'HR Administrator',joiningDate:new Date('2026-01-02'),salary:250000,status:EmployeeStatus.ACTIVE,departmentId:engineering.id,userId:admin.id} })
  console.log('Seed complete. Login: admin@ems.local / Admin@12345')
}
main().finally(()=>prisma.$disconnect())
