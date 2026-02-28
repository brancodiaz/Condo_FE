# Architecture Overview - CondoGestApp

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                     │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│   │  Web Browser  │  │  Mobile App  │  │  Admin Panel │            │
│   │  (Angular 21) │  │   (Future)   │  │   (Future)   │            │
│   └──────┬───────┘  └──────────────┘  └──────────────┘            │
└──────────┼────────────────────────────────────────────────────────-─┘
           │ HTTPS (JWT Bearer)
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ASP.NET Core Web API                              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Controllers │  │  Middleware   │  │  Swagger/OpenAPI Docs    │  │
│  │  (20+ total) │  │  (Exception  │  │  (v1, condominiums,      │  │
│  │              │  │   Handler)   │  │   auth, public)          │  │
│  └──────┬───────┘  └──────────────┘  └──────────────────────────┘  │
│         │                                                           │
│  ┌──────▼──────────────────────────────────────────────────────┐   │
│  │              Application Layer (Use Cases)                   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │   │
│  │  │   Auth   │ │  Condos  │ │  Blocks  │ │    Units     │  │   │
│  │  │ Services │ │ Services │ │ Services │ │  Services    │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │   │
│  │  │  Users   │ │  Roles   │ │Maintenanc│ │  Payments    │  │   │
│  │  │ Services │ │ Services │ │ Services │ │  Services    │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │   │
│  │  │ Common   │ │Reservatio│ │Incidents │ │  Contacts    │  │   │
│  │  │ Areas    │ │ Services │ │ Services │ │  Services    │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐              │   │
│  │  │Announce- │ │Notifica- │ │  Invitations  │              │   │
│  │  │ ments    │ │ tions    │ │   Services    │              │   │
│  │  └──────────┘ └──────────┘ └──────────────┘              │   │
│  └──────┬──────────────────────────────────────────────────────┘   │
│         │                                                           │
│  ┌──────▼──────────────────────────────────────────────────────┐   │
│  │              Infrastructure Layer                            │   │
│  │  ┌───────────┐ ┌───────────┐ ┌────────────┐ ┌───────────┐ │   │
│  │  │ JWT Token │ │  SendGrid │ │  Exception  │ │  Caching  │ │   │
│  │  │ Provider  │ │  Email    │ │  Middleware  │ │  Service  │ │   │
│  │  └───────────┘ └───────────┘ └────────────┘ └───────────┘ │   │
│  │  ┌───────────┐ ┌───────────┐                               │   │
│  │  │   File    │ │Notification│                              │   │
│  │  │  Storage  │ │  Dispatch  │                              │   │
│  │  └───────────┘ └───────────┘                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│         │                                                           │
│  ┌──────▼──────────────────────────────────────────────────────┐   │
│  │              Persistence Layer                               │   │
│  │  ┌─────────────────────┐  ┌────────────────────────┐       │   │
│  │  │  EF Core (Writes)   │  │  Dapper (Reads)        │       │   │
│  │  │  - DbContext         │  │  - Read Repositories   │       │   │
│  │  │  - Repositories      │  │  - Optimized queries   │       │   │
│  │  │  - Unit of Work      │  │                        │       │   │
│  │  │  - Migrations        │  │                        │       │   │
│  │  └──────────┬──────────┘  └───────────┬────────────┘       │   │
│  └─────────────┼─────────────────────────┼─────────────────────┘   │
└────────────────┼─────────────────────────┼─────────────────────────┘
                 │                         │
                 ▼                         ▼
          ┌──────────────────────────────────────┐
          │          SQL Server                   │
          │    Database: Condominio               │
          │    Auth: Windows Integrated           │
          │    + File Storage (local/cloud)       │
          └──────────────────────────────────────┘
```

## Clean Architecture Layers

### Domain Layer (`Condominio.Domain`)
- **Purpose:** Business entities, enums, and value objects
- **Dependencies:** None (innermost layer)
- **Contains:** 40+ entities, enums
- **Base Classes:**
  - `EntityBase<TKey>` → audit fields (CreatedAt, ModifiedAt, DeletedAt, Active)
  - `EntityInt`, `EntityGuid`, `EntityString` → typed ID variants
  - `EntityTenantInt`, `EntityTenantGuid` → multi-tenant variants with TenantId
  - `CatalogBase` → lookup/catalog tables (Code, Name, Description)

### Application Layer (`Condominio.Application`)
- **Purpose:** Use cases, business logic orchestration, DTOs
- **Dependencies:** Domain
- **Contains:** 130+ files organized by feature
- **Pattern:** Service interfaces + implementations, repository interfaces, DTOs
- **Features organized as:**
  ```
  Features/{FeatureName}/
  ├── DTOs/              # Request/Response models
  ├── Interfaces/        # Service & repository contracts
  │   └── Repositories/
  └── Services/          # Business logic implementations
  ```

### Infrastructure Layer (`Condominio.Infrastructure`)
- **Purpose:** External service integrations, cross-cutting concerns
- **Dependencies:** Application, Domain
- **Contains:** JWT auth, SendGrid email, exception middleware, caching, file storage, notification dispatch

### Persistence Layer (`Condominio.Persistence` + `Condominio.Persistence.Dapper`)
- **Purpose:** Data access (CQRS-lite: EF Core for writes, Dapper for reads)
- **Dependencies:** Application, Domain
- **Contains:** DbContext, 25+ EF configurations, 20+ repositories, migrations

### Common Library (`Common`)
- **Purpose:** Shared utilities across all layers
- **Contains:** Custom exceptions, pagination models, string extensions, error messages

## Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Angular 21 App                           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Core (Singleton Services)                              │ │
│  │  ├── AuthService (signal-based state)                   │ │
│  │  ├── TokenService (in-memory + session)                 │ │
│  │  ├── GoogleAuthService (OAuth2)                         │ │
│  │  ├── StorageService (platform-aware)                    │ │
│  │  ├── ThemeService (dark/light mode per user)            │ │
│  │  ├── NotificationService (bell notifications)           │ │
│  │  ├── CondoContextService (current condo + role)         │ │
│  │  ├── authGuard / guestGuard / roleGuard                 │ │
│  │  └── authInterceptor (Bearer + refresh + tenant header) │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Layout Components                                      │ │
│  │  ├── TopBarComponent (app name, user, theme, notifs)    │ │
│  │  ├── SidebarComponent (role-based menu, role indicator) │ │
│  │  └── CondoShellLayout (top bar + sidebar wrapper)       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Features (Lazy-loaded Routes)                          │ │
│  │  ├── Auth (login, register, passwords, verify)          │ │
│  │  ├── Condos (selection shell, cards, create/join)       │ │
│  │  ├── Dashboard (role-based views)                       │ │
│  │  ├── Blocks (block management)                          │ │
│  │  ├── Units (unit management, residents)                 │ │
│  │  ├── Maintenance (fees config, charges)                 │ │
│  │  ├── Payments (registration, approval, receipts)        │ │
│  │  ├── CommonAreas (areas CRUD, reservations)             │ │
│  │  ├── Incidents (report, track, interact)                │ │
│  │  ├── Announcements (create, view, attachments)          │ │
│  │  ├── Contacts (register, approve, browse)               │ │
│  │  └── Notifications (notification center)                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Shared (Cross-feature Utilities)                       │ │
│  │  ├── Validators (password, forms)                       │ │
│  │  ├── Components (file upload, status badges, etc.)      │ │
│  │  └── Pipes (date, currency, status formatters)          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### State Management
- **Signals** (`signal()`, `computed()`) for reactive state
- **No external state library** (NgRx, etc.) — Angular signals are sufficient
- **Auth state:** `currentUser` signal in AuthService (singleton)
- **Condo context:** `currentCondo` + `currentRole` signals in CondoContextService
- **Theme state:** `isDarkMode` signal in ThemeService (persisted per user)
- **Notifications:** `unreadCount` signal in NotificationService
- **Feature state:** Local signals in components + `toSignal()` for HTTP

### Routing Strategy
- Lazy-loaded feature routes
- Guards: `authGuard` (protected), `guestGuard` (public-only), `roleGuard` (role-based)
- SSR with client-side rendering for auth routes
- Condo-scoped routes nested under `/condos/:condoId/`

## Multi-Tenancy Model

```
User ──┬── GlobalRole (Admin/User) ── system-wide
       │
       ├── UserRoleCondominium ──── Role scoped to Condominium
       ├── UserRoleBlock ────────── Role scoped to Block
       └── UserRoleUnit ────────── Role scoped to Unit
```

- Tenant isolation at entity level via `EntityTenantGuid`/`EntityTenantInt`
- `x-empresa-id` header carries tenant context in requests
- Roles: ADMIN, OWNER, TENANT, PRESIDENT, SECRETARY, TREASURER, RELATIVE, SECURITY, CLEANING_UNIT, CLEANING_BLOCK, CLEANING_CONDO
- A user can hold different roles in different condominiums
- A user can be OWNER in one unit and TENANT in another within the same condo

## Navigation Flow

```
[Unauthenticated]          [Condo Selection]           [Inside Condo]
No nav menu         →      Top bar only          →     Top bar + Left sidebar
                           - App name                   - Role-based menu items
                           - User menu                  - Role indicator
                           - Theme toggle               - All condo operations
                           - Notifications bell
```

## Data Flow (Example: Register Payment)

```
Frontend                    Backend
────────                    ───────
PaymentService.create()
  → POST /api/v1/payments
  → multipart/form-data (receipt file optional)
                            → PaymentsController.Create()
                            → IPaymentService.Create()
                            → Validate file (type, size, content)
                            → IPaymentRepository.AddAsync()
                            → IFileStorageService.Save() (if attachment)
                            → UnitOfWork.SaveChangesAsync()
                            → INotificationService.Notify(admin, "New payment")
                            → Return PaymentResponse DTO
  ← HTTP 200 + JSON
```

## Security Architecture

1. **Authentication:** JWT Bearer tokens (HS256 symmetric key)
2. **Token lifecycle:** Access (30 days) + Refresh (30 days, 15 if remember-me off)
3. **Password security:** bcrypt hashing via ASP.NET Identity PasswordHasher
4. **Password policy:** 8+ chars, uppercase, lowercase, digit, special char
5. **Email verification:** Token-based, 24-hour expiry
6. **CORS:** Configured for localhost:5173 (dev)
7. **Sensitive config:** .NET User Secrets (JWT secret, Google OAuth)
8. **Soft deletes:** No data physically deleted (DeletedAt + Active flag)
9. **File upload security:** Type whitelist (PDF, JPG, PNG), size limits, content inspection (magic bytes validation)
10. **OWASP Top 10:** Input validation, parameterized queries, CSRF protection, security headers
11. **Role-based authorization:** Per-condominium role checks on all protected endpoints

## Monetization Architecture

- **Freemium model:** Most features available for free
- **Paid features:** Gated via SubscriptionPlan entity linked to Condominium
- **Feature flags:** Backend checks subscription level before allowing access to premium features
