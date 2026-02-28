# Backend Documentation - Condominio_FVDL_API

## Solution Structure

```
Condominio_FVDL_API.sln
├── Condominio_FVDL_API/           # Web API host (controllers, Program.cs)
│   ├── Controllers/
│   │   ├── Auth/                  # AuthController, RolesController, PermissionsController
│   │   ├── Condominiums/          # CondominiumsController, BlocksController, UnitsController, etc.
│   │   ├── Maintenance/           # MaintenanceFeesController, MaintenanceChargesController
│   │   ├── Payments/              # PaymentsController
│   │   ├── CommonAreas/           # CommonAreasController, ReservationsController
│   │   ├── Incidents/             # IncidentsController, IncidentTypesController
│   │   ├── Contacts/              # ContactsController, ContactTypesController
│   │   ├── Announcements/         # AnnouncementsController
│   │   ├── Notifications/         # NotificationsController
│   │   ├── Invitations/           # InvitationsController
│   │   ├── Users/                 # UsersController
│   │   └── DevelopmentController.cs  # DEBUG only
│   ├── Program.cs                 # App bootstrap
│   ├── Migrations/                # EF Core migrations
│   └── appsettings.json
│
├── Condominio.Domain/             # Entities & enums
│   ├── Entities/
│   │   ├── Auth/                  # User, GlobalRole, Role, Permission, tokens
│   │   ├── Condominiums/          # Condominium, Block, Unit, UnitType
│   │   ├── Maintenance/           # MaintenanceFee, MaintenanceCharge
│   │   ├── Payments/              # Payment, PaymentAttachment, PaymentMaintenanceCharge
│   │   ├── CommonAreas/           # CommonArea, Reservation
│   │   ├── Incidents/             # Incident, IncidentType, IncidentInteraction
│   │   ├── Contacts/              # ImportantContact, ContactType
│   │   ├── Announcements/         # Announcement, AnnouncementAttachment
│   │   ├── Notifications/         # Notification
│   │   └── Invitations/           # CondominiumInvitation
│   ├── Enums/                     # All enums (see DATABASE.md for full list)
│   └── EntityBase/                # EntityBase<T>, EntityInt, EntityGuid, EntityTenant*
│
├── Condominio.Application/        # Business logic & DTOs
│   └── Features/
│       ├── Auth/
│       │   ├── Account/
│       │   │   ├── DTOs/          # LoginRequest/Response, RegisterRequest, etc.
│       │   │   ├── Interfaces/    # IAccountService, ITokenProvider
│       │   │   └── UseCases/      # Each auth action as separate service
│       │   ├── Permissions/       # Permission CRUD
│       │   └── Roles/             # Role CRUD
│       ├── Condominiums/          # Condo CRUD + member management
│       ├── Blocks/                # Block CRUD (+ default block logic)
│       ├── Units/                 # Unit CRUD + unit types
│       ├── UnitUsers/             # Resident/person management
│       ├── Users/                 # User profile management
│       ├── Maintenance/           # Fee config + charge generation
│       │   ├── DTOs/
│       │   ├── Interfaces/
│       │   └── Services/
│       ├── Payments/              # Payment registration + approval
│       │   ├── DTOs/
│       │   ├── Interfaces/
│       │   └── Services/
│       ├── CommonAreas/           # Area CRUD + reservation management
│       │   ├── DTOs/
│       │   ├── Interfaces/
│       │   └── Services/
│       ├── Incidents/             # Incident lifecycle + interactions
│       │   ├── DTOs/
│       │   ├── Interfaces/
│       │   └── Services/
│       ├── Contacts/              # Contact submission + approval
│       │   ├── DTOs/
│       │   ├── Interfaces/
│       │   └── Services/
│       ├── Announcements/         # Announcement CRUD + attachments
│       │   ├── DTOs/
│       │   ├── Interfaces/
│       │   └── Services/
│       ├── Notifications/         # Notification dispatch + retrieval
│       │   ├── DTOs/
│       │   ├── Interfaces/
│       │   └── Services/
│       └── Invitations/           # Invitation creation + acceptance
│           ├── DTOs/
│           ├── Interfaces/
│           └── Services/
│
├── Condominio.Persistence/        # EF Core data access
│   ├── ApplicationDbContext.cs
│   ├── UnitOfWork.cs
│   ├── EFConfigurations/          # 25+ entity configurations
│   └── Repositories/              # 20+ repository implementations
│
├── Condominio.Persistence.Dapper/ # Read-optimized data access
│   ├── Interfaces/                # Read repository interfaces
│   └── Repositories/              # Dapper implementations
│
├── Condominio.Infrastructure/     # Cross-cutting concerns
│   ├── Auth/                      # TokenProvider (JWT generation)
│   ├── Services/
│   │   ├── EmailService (SendGrid)
│   │   ├── TemplateService
│   │   ├── FileStorageService     # Secure file upload/download
│   │   └── NotificationDispatcher # System notification creation
│   ├── Middlewares/               # GlobalExceptionHandlerMiddleware
│   └── Extensions/                # DI registration
│
└── Common/                        # Shared utilities
    ├── Exceptions/                # NotFoundException, ForbiddenAccessException, etc.
    ├── Pagination/                # PaginationFilter, PaginationResponse<T>
    └── Extensions/                # String extensions
```

## Dependency Injection Setup

Each layer registers its services via extension methods in `Program.cs`:

```csharp
// Program.cs
builder.Services.AddApplicationServices();      // Application layer services
builder.Services.AddInfrastructureServices();    // JWT, email, middleware, file storage
builder.Services.AddPersistenceServices();       // EF Core, repositories, UoW
builder.Services.AddDapperServices();            // Dapper read repositories
```

### Service Lifetimes
- All services: **Scoped** (per-request)
- Keyed services: `ICatalogBaseService` resolved by `CatalogTypes` enum

## Controllers Reference

| Controller | Route | Auth | Group |
|-----------|-------|------|-------|
| AuthController | `api/v1/auth` | Mixed | auth |
| RolesController | `api/v1/roles` | superadmin | auth |
| PermissionsController | `api/v1/permissions` | superadmin | auth |
| CondominiumsController | `api/v1/condominiums` | User,Admin | condominiums |
| BlocksController | `api/v1/blocks` | Authorize | condominiums |
| UnitsController | `api/v1/blocks/{blockId}/units` | Authorize | condominiums |
| CondominiumUnitsController | `api/v1/condominiums/units` | Authorize | condominiums |
| UnitTypesController | `api/v1/unittypes` | Authorize | condominiums |
| UnitUsersController | `api/v1/blocks/{blockId}/units/{unitId}/persons` | Authorize | condominiums |
| MaintenanceFeesController | `api/v1/maintenance-fees` | Admin | condominiums |
| MaintenanceChargesController | `api/v1/maintenance-charges` | Authorize | condominiums |
| PaymentsController | `api/v1/payments` | Authorize | condominiums |
| CommonAreasController | `api/v1/common-areas` | Authorize | condominiums |
| ReservationsController | `api/v1/reservations` | Authorize | condominiums |
| IncidentsController | `api/v1/incidents` | Authorize | condominiums |
| IncidentTypesController | `api/v1/incident-types` | Authorize | condominiums |
| ContactsController | `api/v1/contacts` | Authorize | condominiums |
| ContactTypesController | `api/v1/contact-types` | Authorize | condominiums |
| AnnouncementsController | `api/v1/announcements` | Authorize | v1 |
| NotificationsController | `api/v1/notifications` | Authorize | v1 |
| InvitationsController | `api/v1/invitations` | Mixed | v1 |
| UsersController | `api/v1/users` | Authorize | v1 |
| DevelopmentController | `api/dev` | None | DEBUG only |

## Generic CRUD Pattern

Most controllers extend `AppControllerBase<T>` which provides:
- `Find(id)` → GET /{id}
- `FindAll(PaginationFilter)` → GET /
- `Create(request)` → POST /
- `Update(id, request)` → PUT /{id}
- `Delete(id)` → DELETE /{id}
- `GetComboList()` → GET /combo-list

Services implement `IBaseService<TKey, TEntityResponse, TCreateRequest, TUpdateRequest, TComboList>`.

## Unit of Work

`IUnitOfWork` aggregates 20+ repositories and provides transaction management:

```csharp
public interface IUnitOfWork
{
    // Existing
    IUserRepository Users { get; }
    ICondominiumRepository Condominiums { get; }
    IBlockRepository Blocks { get; }
    IUnitRepository Units { get; }
    // ... existing repositories

    // New
    IMaintenanceFeeRepository MaintenanceFees { get; }
    IMaintenanceChargeRepository MaintenanceCharges { get; }
    IPaymentRepository Payments { get; }
    ICommonAreaRepository CommonAreas { get; }
    IReservationRepository Reservations { get; }
    IIncidentRepository Incidents { get; }
    IIncidentTypeRepository IncidentTypes { get; }
    IIncidentInteractionRepository IncidentInteractions { get; }
    IImportantContactRepository ImportantContacts { get; }
    IContactTypeRepository ContactTypes { get; }
    IAnnouncementRepository Announcements { get; }
    INotificationRepository Notifications { get; }
    ICondominiumInvitationRepository Invitations { get; }

    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
```

## Key Business Logic

### Default Block
- When a condominium is created with `HasBlocks = false`, a default block is auto-created with `IsDefault = true`
- The default block is hidden from the UI but all units are associated to it
- If `HasBlocks` changes to `true`, the default block becomes visible

### Payment Workflow
1. Owner registers payment (optional receipt upload)
2. Payment status = `Pending`
3. Admin reviews → `Approved` or `Rejected` (with reason)
4. On approval → linked MaintenanceCharges updated to `Paid`
5. Notification sent to owner on approval/rejection

### File Upload Security
- Allowed types: PDF, JPG, JPEG, PNG (whitelist)
- Max file size: configurable (e.g., 5MB)
- Magic bytes validation (content inspection, not just extension)
- Files stored outside web root
- Served via controller action with auth check

### Incident Lifecycle
- Open → InReview → InProgress → Resolved → Closed
- User can reopen (Resolved/Closed → Open)
- Each status change creates an IncidentInteraction record
- Assignment follows IncidentType.AssignmentTarget config

### Notification System
- Notifications created server-side by `INotificationDispatcher`
- Events that trigger notifications:
  - Payment approved/rejected
  - Incident status change
  - Reservation approved/rejected
  - New announcement published
  - Invitation received
- Frontend polls or uses SignalR (future) for real-time updates

## Exception → HTTP Status Mapping

| Exception | Status Code |
|----------|-------------|
| NotFoundException | 404 |
| UnauthorizedAccessException | 401 |
| ForbiddenAccessException | 403 |
| ValidationException | 400 |
| InvalidOperationException | 500 |
| HttpRequestException | 504 |
| NullResponseException | 500 |

## Configuration (appsettings.json)

```json
{
  "ConnectionStrings": {
    "CondominioConnection2": "Server=.;Database=Condominio;..."
  },
  "Jwt": { "Secret": "***", "Issuer": "***", "Audience": "***" },
  "Tokens": {
    "AccessExpirationInMinutes": 43200,
    "RefreshExpirationInMinutes": 43200,
    "EmailVerificationExpirationInMinutes": 1440,
    "PasswordExpirationInMinutes": 1440
  },
  "EmailSettings": {
    "FromEmail": "branco1125@gmail.com",
    "FromName": "CondoGestApp",
    "SendGridApiKey": "***"
  },
  "AuthPaths": {
    "EmailConfirmation": "https://condoapp.com/email-confirmation",
    "ResetPassword": "https://condoapp.com/reset-password"
  },
  "FileStorage": {
    "BasePath": "./uploads",
    "MaxFileSizeBytes": 5242880,
    "AllowedExtensions": [".pdf", ".jpg", ".jpeg", ".png"]
  },
  "Invitations": {
    "ExpirationInDays": 7,
    "BaseUrl": "https://condoapp.com/invitations/accept"
  }
}
```

Sensitive values (JWT secret, Google OAuth) stored in .NET User Secrets (ID: `9e4580e6-a4aa-4e39-83dc-4fc336e3f16c`).

## NuGet Packages (Key)

| Package | Version | Purpose |
|---------|---------|---------|
| Microsoft.EntityFrameworkCore.SqlServer | 9.0.4 | SQL Server provider |
| Dapper | 2.1.66 | Read-optimized queries |
| Microsoft.AspNetCore.Authentication.JwtBearer | 8.0.16 | JWT auth middleware |
| Microsoft.IdentityModel.JsonWebTokens | 8.8.0 | JWT generation |
| Google.Apis.Auth | 1.70.0 | Google OAuth validation |
| SendGrid | 9.29.3 | Email delivery |
| Swashbuckle.AspNetCore | 6.9.0 | Swagger/OpenAPI |
| Microsoft.AspNetCore.Mvc.Versioning | 5.1.0 | API versioning |
| RazorEngineCore | 2024.4.1 | Email template rendering |
