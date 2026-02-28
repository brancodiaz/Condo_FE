# CondoGestApp - Condominium Management SaaS

## Project Overview

Multi-tenant SaaS web application for condominium management. Supports property administration, resident management, role-based access control, maintenance payments, common area reservations, incident management, announcements, and important contacts. A user can belong to multiple condominiums simultaneously.

**Full specification:** See `docs/SPEC.md` for the complete functional specification with all business rules and clarifications.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Angular (standalone components, signals) | 21.1.0 |
| UI Framework | Tailwind CSS + DaisyUI | 4.1.12 / 5.5.18 |
| Backend | ASP.NET Core Web API | .NET 8.0 |
| ORM (Write) | Entity Framework Core | 9.0.4 |
| ORM (Read) | Dapper | 2.1.66 |
| Database | SQL Server | Local (Windows Auth) |
| Email | SendGrid | 9.29.3 |
| Auth | JWT + Google OAuth2 | - |

## Repository Structure

```
CondominioApp/
├── CLAUDE.md                          # This file
├── docs/                              # Architecture documentation
│   ├── SPEC.md                        # Complete functional specification
│   ├── ARCHITECTURE.md                # System architecture overview
│   ├── BACKEND.md                     # Backend detailed documentation
│   ├── FRONTEND.md                    # Frontend detailed documentation
│   ├── DATABASE.md                    # Entity model & DB schema
│   └── API.md                         # API endpoints reference
├── Condo_FE/                          # Angular 21 frontend
│   └── src/
│       ├── app/
│       │   ├── core/                  # Singleton services, guards, interceptors
│       │   │   ├── auth/              # Auth guards, interceptor, services, models
│       │   │   ├── services/          # StorageService, ThemeService, NotificationService
│       │   │   └── environments/      # Dev/prod config
│       │   ├── features/              # Feature modules
│       │   │   ├── auth/              # Login, register, forgot/reset password, verify email
│       │   │   ├── condos/            # Condo shell, cards, actions, service
│       │   │   ├── dashboard/         # Dashboard page (role-based)
│       │   │   ├── blocks/            # Block management
│       │   │   ├── units/             # Unit management
│       │   │   ├── maintenance/       # Maintenance fees & payments
│       │   │   ├── common-areas/      # Common areas & reservations
│       │   │   ├── incidents/         # Incident management
│       │   │   ├── announcements/     # Announcements/communications
│       │   │   ├── contacts/          # Important contacts
│       │   │   └── notifications/     # Notification center
│       │   └── shared/                # Validators, pipes, shared components
│       ├── styles.css                 # Tailwind + DaisyUI global styles
│       └── index.html                 # HTML entry point
└── Condominio_FVDL_API/              # .NET 8 backend
    ├── Condominio_FVDL_API/           # ASP.NET Core Web API (controllers, Program.cs)
    ├── Condominio.Domain/             # Entities, enums, base classes
    ├── Condominio.Application/        # Services, DTOs, interfaces (Features/)
    ├── Condominio.Persistence/        # EF Core DbContext, repositories, migrations
    ├── Condominio.Persistence.Dapper/ # Dapper read repositories
    ├── Condominio.Infrastructure/     # JWT, email, middleware, caching, file upload
    └── Common/                        # Exceptions, pagination, extensions
```

## Architecture Pattern

**Backend:** Clean Architecture with 4 layers:
- **Domain** → Entities, enums (zero external dependencies)
- **Application** → Use cases, DTOs, service interfaces & implementations
- **Infrastructure** → JWT auth, email (SendGrid), middleware, file storage
- **Persistence** → EF Core (writes) + Dapper (reads), Unit of Work, repositories

**Frontend:** Feature-based modular architecture with Angular standalone components and signal-based state management.

## Key Conventions

### Backend (.NET)

- **Entities** inherit from `EntityBase<TKey>` (audit fields: CreatedAt, ModifiedAt, DeletedAt, Active, ModifiedById)
- **Tenant entities** use `EntityTenantGuid` or `EntityTenantInt` (include TenantId)
- **Catalog entities** use `CatalogBase` (Code, Name, Description)
- **Repositories** follow interface in Application, implementation in Persistence
- **Unit of Work** (`IUnitOfWork`) aggregates all repositories + transaction management
- **Services** are registered as `Scoped` via extension methods in each layer
- **Controllers** use `[ApiVersion("1.0")]` and route `api/v{version}/[controller]`
- **Generic CRUD** via `AppControllerBase<T>` and `IBaseService<TKey, ...>`
- **Exception handling** via `GlobalExceptionHandlerMiddleware` (maps exceptions → HTTP status codes)
- **Soft deletes** via `DeletedAt` timestamp and `Active` flag
- **GUIDs** use `NEWSEQUENTIALID()` as default values in SQL Server
- **Async/await** throughout with CancellationToken support
- **Nullable** enabled across all projects
- **File uploads** validated for security (type, size, content inspection) before storage

### Frontend (Angular)

- **Standalone components** only (no NgModules)
- **Signals** for state management (`signal()`, `computed()`)
- **Functional guards** and **functional interceptors**
- **Reactive Forms** for all form handling
- **DaisyUI** components with Tailwind utility classes
- **Theme:** Light = DaisyUI "cupcake"/"bumblebee", Dark = DaisyUI "dark", primary accent `#4a6785`
- **Dark/Light mode:** Global per user, persisted in user preferences
- **Language:** Spanish (UI text in Spanish)
- **SSR** enabled with Express server
- **Feature folders** under `src/app/features/`
- **Core services** under `src/app/core/`
- **Shared utilities** under `src/app/shared/`

### Navigation Structure

- **Unauthenticated:** No navigation menu
- **Welcome/Condo selection:** Top bar only (app name, user name, user menu, theme toggle)
- **Inside condominium:** Top bar + Left sidebar (role-based options, role indicator)

## Authentication Flow

1. User registers → backend creates user + email verification token → SendGrid sends welcome email
2. User verifies email via link → account activated
3. Login (email/password or Google OAuth) → JWT access token + refresh token returned
4. Frontend stores access token in-memory, refresh token in sessionStorage
5. Auto-refresh scheduled 60 seconds before token expiry
6. HTTP interceptor adds Bearer token; on 401 → refresh → retry
7. Refresh failure → logout

## Post-Authentication Flow

1. User is redirected to **condo selection screen**
2. User selects a condominium from their list OR creates a new one (becomes admin)
3. If user belongs to only 1 condominium → auto-navigate to dashboard
4. User can return to condo selection from dashboard without logout

## Authorization Model

```
GlobalRole (Admin, User) → applied system-wide
Role (ADMIN, OWNER, TENANT, PRESIDENT, SECRETARY, TREASURER, RELATIVE,
      SECURITY, CLEANING_UNIT, CLEANING_BLOCK, CLEANING_CONDO) → scoped per context

User ←M:M→ Role ←→ Condominium  (via UserRoleCondominium)
User ←M:M→ Role ←→ Block         (via UserRoleBlock)
User ←M:M→ Role ←→ Unit          (via UserRoleUnit)

A user can hold different roles in different condominiums.
A user can be OWNER in one unit and TENANT in another within the same condo.
```

## User Invitation

- Admin can **register users manually** or **send invitation link**
- In both cases, the admin specifies the **role** for the invited user

## Monetization Model

- **Freemium:** Most features are free
- Some features will be **paid-only** (to be defined)

## MVP Priority Order

| # | Module | Description |
|---|--------|-------------|
| 1 | Login | Full auth (own + Google, register, verify, recovery) |
| 2 | Condominiums | CRUD, selection, creation, member assignment |
| 3 | Blocks | CRUD, hidden default block |
| 4 | Units | CRUD, types, user/resident association |
| 5 | Maintenance + Payments | Fee config, payment registration, approval, receipts |
| 6 | Notifications | In-app notification system (bell), system events |
| 7 | Common Areas + Reservations | CRUD areas, reservations, optional costs |
| 8 | Important Contacts | Registration, admin approval, dynamic types |
| 9 | Announcements | CRUD, block/condo scope, attachments, notification |
| 10 | Incidents | Pre-loaded types, states, visibility, history, reopen |

## Development Setup

### Backend
```bash
cd Condominio_FVDL_API
dotnet restore
dotnet ef database update --project Condominio.Persistence --startup-project Condominio_FVDL_API
dotnet run --project Condominio_FVDL_API
# API: https://localhost:7067 | Swagger: https://localhost:7067/swagger
```

### Frontend
```bash
cd Condo_FE
npm install
npm start
# App: http://localhost:4200 (proxied to API on :7067)
```

### Database
- SQL Server local instance with Windows Authentication
- Connection string: `Server=.;Database=Condominio;Integrated Security=True;TrustServerCertificate=true`
- Sensitive config (JWT secret, Google OAuth) in .NET User Secrets

## API Base URL
- Dev: `https://localhost:7067/api/v1`
- Swagger docs grouped by: `v1`, `condominiums`, `auth`, `public`

## Current Implementation Status

### MVP Complete (All 10 Priorities)
- Full authentication (register, login, Google OAuth, email verification, password reset, refresh tokens)
- Condominium CRUD + member assignment
- Block CRUD (buildings within condominiums)
- Unit CRUD (apartments/lots within blocks) + unit types + resident management
- Maintenance fees & payment management (fee config, payment registration, approval, receipts)
- In-app notification system (bell icon, system events)
- Common areas & reservations (CRUD areas, reservations, optional costs)
- Important contacts (registration, admin approval, dynamic types)
- Announcements with attachments & scoped delivery (block/condo scope)
- Incident management (types, states, visibility, history, reopen)
- Role & permission management (superadmin)
- User profile management
- Pagination across all list endpoints
- Global exception handling middleware
- Email notifications (SendGrid)
- File upload infrastructure (payment receipts, announcement attachments)
- Left sidebar navigation (role-based, ordered by usage frequency)
- Frontend: auth pages, condo selection shell, dashboard, all feature modules

### Roadmap Post-MVP (Not Yet Implemented)
**P0 — Financiero Core:**
- Cuotas extraordinarias / derramas (US-020)
- Recibos con numeración correlativa y estados (US-021)
- Motor de mora con intereses (US-022)
- Pagos parciales e imputación configurable (US-023)
- Estado de cuenta por unidad — reporte PDF/Excel (US-024)
- Reporte de morosidad por antigüedad (US-025)
- Egresos/gastos con categorías y comprobantes (US-040)
- Cuentas bancarias y caja chica (US-041)

**P1 — Extensiones:**
- Reporte ingresos vs egresos (US-042)
- Presupuesto anual y ejecución presupuestaria (US-043)
- Dashboard KPIs financieros (US-100)
- Personalización de dashboard por rol (US-101)
- Coeficiente de participación / m² en unidades (US-010)
- Vehículos y mascotas por unidad (US-012)
- Órdenes de trabajo derivadas de incidentes (US-062)

**P2 — Módulos Nuevos:**
- Biblioteca digital de documentos (US-051)
- Garantías de áreas comunes (US-072)
- Preautorización QR y bitácora de portería (US-080, US-081)
- Votaciones y asambleas online (US-090)
- Bitácora de auditoría (US-002)

**Pendientes Generales:**
- User invitation system (links)
- Dark/Light mode toggle (global per user)
- Role-based dashboard views
- Freemium/paid feature gating
