# EMS API

Production-oriented Express + TypeScript API for the Employee Management System.

## Stack
- Node.js + Express 5
- TypeScript
- PostgreSQL + Prisma
- JWT authentication
- bcrypt password hashing
- Zod validation
- Helmet + CORS

## Local setup

```bash
cd server
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

API defaults to `http://localhost:4000`.

## Core endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `GET/POST/PATCH/DELETE /api/employees`
- `GET/POST/PATCH/DELETE /api/departments`
- `GET /api/attendance`
- `POST /api/attendance/check-in`
- `POST /api/attendance/check-out`
- `GET/POST/PATCH /api/leaves`
- `GET /api/payroll`
- `POST /api/payroll/process`
- `GET/POST /api/performance`
- `GET /api/dashboard`
