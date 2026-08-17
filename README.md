<div align="center">

# 🧩 ENTERPRISE EMPLOYEE MANAGEMENT SYSTEM
### HR · PAYROLL · ATTENDANCE · LEAVE · PERFORMANCE · ANALYTICS

![Status](https://img.shields.io/badge/STATUS-ACTIVE-00ff88?style=for-the-badge&labelColor=0b1020)
![Frontend](https://img.shields.io/badge/FRONTEND-REACT%20%7C%20TYPESCRIPT-61dafb?style=for-the-badge&logo=react&logoColor=111827)
![Backend](https://img.shields.io/badge/BACKEND-NODE%20%7C%20EXPRESS-68a063?style=for-the-badge&logo=node.js&logoColor=111827)
![Database](https://img.shields.io/badge/DATABASE-POSTGRESQL-4169e1?style=for-the-badge&logo=postgresql&logoColor=white)
![ORM](https://img.shields.io/badge/ORM-PRISMA-2d3748?style=for-the-badge&logo=prisma&logoColor=white)

**A full-stack workforce operations platform for managing employees, departments and HR workflows through a responsive executive dashboard.**

[Architecture](#architecture) · [Features](#features) · [Setup](#setup) · [Security](#security) · [Roadmap](#roadmap)

</div>

---

## 🎯 Product overview

EMS brings common workforce operations into one interface for **administrators, HR managers and employees**. The repository contains both a React/Vite frontend and a Node/TypeScript backend with Prisma database models.

The frontend is designed as an executive-style dashboard while the backend provides the foundation for authenticated, persistent business workflows.

## ✨ Features

- 👥 Employee records and search
- 🏢 Department management
- 🕒 Attendance workflows
- 📝 Leave management
- 💰 Payroll views and salary calculations
- ⭐ Performance workflows
- 📊 Dashboard and workforce analytics
- 🔐 Authentication and role-aware API foundation
- 🌙 Responsive dark/light interface
- 📱 Mobile-friendly navigation

## 🏗️ Architecture

```text
                     React + Vite
                          │
                    API client layer
                          │
                    HTTP / JSON API
                          │
                 Node + TypeScript
                          │
                 Auth / business logic
                          │
                       Prisma
                          │
                    PostgreSQL DB
```

### Repository layout

```text
.
├── src/                 # React + TypeScript frontend
│   ├── App.tsx
│   ├── lib/api.ts       # API client and auth token handling
│   └── styles.css
├── server/              # Backend service
│   ├── src/server.ts
│   └── prisma/
│       ├── schema.prisma
│       └── seed.ts
├── public/              # Static frontend assets, where applicable
├── package.json         # Frontend tooling
├── server/package.json  # Backend tooling
└── .env.example         # Environment variable template
```

## 🛠️ Stack

| Layer | Technology |
|---|---|
| UI | React + TypeScript |
| Build | Vite |
| Styling | CSS / responsive UI |
| Icons | Lucide React |
| Notifications | Sonner |
| API | Node.js + TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Deployment | Vercel/Render-compatible configuration |

## 🚀 Setup

### Frontend

```bash
npm install
npm run dev
```

The frontend expects the API base URL from `VITE_API_URL`. For local development the API client falls back to `http://localhost:4000/api`.

### Backend

```bash
cd server
npm install
```

Create the environment file from the provided template and configure a PostgreSQL connection plus the backend's authentication settings.

Then run the Prisma workflow required by the current schema and start the server using the scripts in `server/package.json`.

### Production build

```bash
npm run build
```

For production, deploy the frontend and backend as separate services or use the included deployment configuration after setting all required environment variables.

## 🔐 Security

EMS is designed as a learning/portfolio implementation and should not be used for real employee data without a security review.

Before production use:

- Enforce authorization on every protected server route.
- Validate and sanitize all client input on the server.
- Hash passwords with a modern password-hashing algorithm.
- Use secure, short-lived authentication/session mechanisms.
- Apply least-privilege database permissions.
- Add audit logging for sensitive HR/payroll actions.
- Protect personally identifiable information and salary data.
- Configure HTTPS, secure headers, CORS and rate limiting.
- Keep secrets out of Git and rotate credentials when exposed.
- Add backups, migrations and disaster-recovery procedures.

> **Never treat the React UI as a security boundary.** The server must independently enforce roles and permissions.

## 🧪 Quality checklist

Before merging meaningful changes:

```bash
npm run build
```

For backend changes, also run the backend's TypeScript/build checks and Prisma validation/migration workflow appropriate to the environment.

## 🗺️ Roadmap

- [ ] Connect every dashboard module to the API
- [ ] Complete role-based frontend routing
- [ ] Add real attendance clock-in/out persistence
- [ ] Complete leave approval workflow
- [ ] Add payroll export and payslip generation
- [ ] Add performance goals and review history
- [ ] Add automated API tests
- [ ] Add frontend component tests
- [ ] Add CI checks on pull requests
- [ ] Add audit-log viewer

## 🤝 Contributing

1. Fork the repository.
2. Create a focused feature or fix branch.
3. Keep UI, API and database changes coherent.
4. Run the relevant build/type checks.
5. Document new environment variables or migrations.
6. Open a pull request with a clear summary and validation notes.

Never commit `.env` files, database credentials or real employee information.

## 👨‍💻 Builder

**Vince Odhiambo** — full-stack developer and technology builder.

---

<p align="center"><sub>Complex workforce operations. One clear interface.</sub></p>
