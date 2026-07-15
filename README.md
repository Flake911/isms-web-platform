<div align="center">

# SentraISMS

**ISO 27001:2022 Information Security Management System Platform**

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)

*Centralize. Secure. Comply.*

A full-stack web platform for managing information security governance in accordance with ISO/IEC 27001:2022. Covers the complete PDCA lifecycle — from risk identification and control implementation through internal audits, management review, and continual improvement.

</div>

---

## Overview

SentraISMS provides organizations with a centralized command center to operationalize their ISMS. Built as a final-year engineering project (PFE), it demonstrates a production-grade architecture with role-based access control, automatic audit logging, evidence management, and full ISO 27001:2022 clause coverage across 30+ functional modules.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| Backend | NestJS 11, Node.js 20 LTS |
| Database | PostgreSQL 16 |
| ORM | Prisma 5 (schema-first, migrations) |
| Auth | JWT (HS256), bcrypt password hashing |
| File uploads | Multer (10 MB limit) |
| API style | RESTful JSON, global validation pipes |

---

## Architecture

```
isms-web-platform/
├── backend/                  # NestJS API — port 3001
│   ├── src/
│   │   ├── auth/             # JWT auth, RBAC guards, roles
│   │   ├── audit-log/        # Global AuditInterceptor
│   │   ├── risks/            # Risk management module
│   │   ├── controls/         # ISO Annex A controls
│   │   ├── incidents/        # Incident lifecycle
│   │   ├── evidence/         # File upload & metadata
│   │   └── ...30+ modules
│   └── prisma/
│       ├── schema.prisma
│       └── seed.ts
├── frontend/                 # Next.js app — port 3000
│   └── src/
│       ├── app/(dashboard)/  # Protected pages
│       ├── components/       # Shared UI components
│       ├── context/          # AuthContext, SidebarContext
│       └── lib/              # API client, export utilities
└── docs/
    └── testing/              # Postman collection, curl scripts, test report
```

---

## Security & Access Control

Two global guards are applied to every route via NestJS's `APP_GUARD` mechanism:

- **JwtAuthGuard** — validates the Bearer token on every request. Only `POST /api/auth/login` is public.
- **RolesGuard** — enforces a numeric role hierarchy. The `@Roles()` decorator sets the minimum required level.

| Role | Level | Capabilities |
|---|---|---|
| Super Admin | 6 | Full platform access |
| Organization Admin | 5 | All modules + user management |
| ISMS Manager | 4 | Create/edit/delete all ISMS records |
| Auditor | 3 | Read all records + audit logs |
| Security Officer | 2 | Create risks, incidents, evidence |
| Employee | 1 | Read-only access |

A global `AuditInterceptor` (registered in `main.ts`) automatically logs all `POST`, `PUT`, `PATCH`, and `DELETE` operations to the audit trail — no manual instrumentation required.

---

## Modules & ISO 27001:2022 Coverage

| Module | Route | ISO Clause / Annex |
|---|---|---|
| Dashboard | `/dashboard` | Overview |
| Context & Scope | `/scope` | Clause 4.1–4.3 |
| Leadership | `/leadership` | Clause 5.1, 5.3 |
| Risk Management | `/risks` | Clause 6.1 |
| Controls (Annex A) | `/controls` | Annex A (93 controls) |
| Statement of Applicability | `/soa` | Clause 6.1.3 |
| Objectives | `/objectives` | Clause 6.2 |
| Assets | `/assets` | A.5.9 |
| Classification | `/classification` | A.5.12–A.5.13 |
| Compliance | `/compliance` | Clause 9.1 |
| Legal & Regulatory | `/legal` | A.5.31 |
| Policies | `/policies` | Clause 5.2, 7.5 |
| Incidents | `/incidents` | A.5.24–A.5.28 |
| Internal Audits | `/audits` | Clause 9.2 |
| CAPA | `/capa` | Clause 10.2 |
| Change Management | `/changes` | Clause 6.3, A.8.32 |
| Evidence | `/evidence` | A.5.28 |
| Vendor Management | `/vendors` | A.5.19–A.5.23 |
| Training | `/training` | Clause 7.2, A.6.3 |
| BCP & DR | `/bcp` | A.5.29–A.5.30 |
| Management Review | `/management-review` | Clause 9.3 |
| Communication | `/communication` | Clause 7.4 |
| Improvement | `/improvement` | Clause 10.1 |
| Threats | `/threats` | A.5.7 |
| Vulnerabilities | `/vulnerabilities` | A.8.8 |
| Users & Access | `/users` | A.5.15–A.5.18 |
| Security Awareness | `/security-awareness` | A.6.3 |
| Audit Trail | `/audit-trail` | Clause 9.2 |
| Reports & Export | `/reports` | — |
| Settings | `/settings` | — |

---

## Getting Started

### Prerequisites

- Node.js 20 LTS
- PostgreSQL 16 running on `localhost:5432`
- npm 10+

### 1. Clone the repository

```bash
git clone https://github.com/Flake911/isms-web-platform.git
cd isms-web-platform
```

### 2. Configure environment variables

Create `backend/.env`:

```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<dbname>?schema=public"
PORT=3001
JWT_SECRET="your-secret-key"
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE=http://localhost:3001/api
```

### 3. Set up the database

```bash
cd backend
npm install
npx prisma db push
npx prisma db seed
```

This seeds a default **Super Admin** account:

| Email | Password |
|---|---|
| `admin@sentraisms.com` | `Admin@2026` |

### 4. Start the backend

```bash
# From /backend
npm run start:dev
# API available at http://localhost:3001/api
```

### 5. Start the frontend

```bash
# From /frontend
npm install
npm run dev
# App available at http://localhost:3000
```

---

## API Testing

A full test suite is available in `docs/testing/`:

| File | Description |
|---|---|
| `SentraISMS.postman_collection.json` | Postman collection (9 test cases, auto JWT flow) |
| `curl-tests.sh` | Bash curl script — run with `bash docs/testing/curl-tests.sh` |
| `Test-API.ps1` | PowerShell equivalent — run with `powershell -File docs/testing/Test-API.ps1` |
| `4.3-testing-and-validation.md` | Full test report with actual results |

All 9 test cases passed (13/13 assertions) on a live PostgreSQL backend:

| ID | Scenario | Result |
|---|---|---|
| TC-01 | Valid login → JWT issued | HTTP 201 ✓ |
| TC-02 | Wrong password rejected | HTTP 401 ✓ |
| TC-03 | Unauthenticated request blocked | HTTP 401 ✓ |
| TC-04 | Insufficient role blocked | HTTP 403 ✓ |
| TC-05 | Risk record created and persisted | HTTP 201 ✓ |
| TC-06 | Duplicate risk-control link upserted | HTTP 201 ✓ |
| TC-07 | File upload enforced (size limit) | HTTP 201 / 413 ✓ |
| TC-08 | Incident Open → In Progress → Closed | HTTP 201/200/200 ✓ |
| TC-09 | Audit log retrievable by Auditor | HTTP 200 ✓ |

---

## Important Notes

- **Never commit `.env` files.** They are listed in `.gitignore`. Create them locally from the templates above.
- The `uploads/` directory stores evidence files locally. In production, replace with S3 or equivalent object storage.
- No MIME-type validation is applied to uploads — restrict to allowed types before any production deployment.

---

## License

This project is licensed under the [MIT License](LICENSE).

Copyright (c) 2026 Flake911
