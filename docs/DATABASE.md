# Database Schema - CondoGestApp

## Database Info

- **Engine:** SQL Server (local instance)
- **Database:** Condominio
- **Auth:** Windows Integrated
- **ORM:** EF Core 9.0.4 (writes) + Dapper 2.1.66 (reads)

## Entity Relationship Diagram - Core

```
┌─────────────────────┐      ┌─────────────────────┐
│      GlobalRole      │      │    SubscriptionPlan  │
│─────────────────────│      │─────────────────────│
│ Id (string, PK)     │      │ Id (Guid, PK)       │
│ Name                │      │ Name                │
│ Description         │      │ ...                 │
└────────┬────────────┘      └────────┬────────────┘
         │ 1:M                        │ 1:M
         ▼                            ▼
┌─────────────────────┐      ┌─────────────────────────┐
│        User          │      │     Condominium          │
│─────────────────────│      │─────────────────────────│
│ Id (int, PK)        │      │ Id (Guid, PK)           │
│ Email               │      │ Name                    │
│ FirstName           │      │ Address                 │
│ MiddleName          │      │ Country                 │
│ LastName            │      │ TotalBlocks             │
│ DateOfBirth         │      │ TotalUnits              │
│ PhoneNumber         │      │ HasBlocks               │
│ DocumentType        │      │ PlanId                  │
│ DocumentId          │      │ SubscriptionExpiresAt   │
│ PasswordHash        │      │ SubscriptionPlanId (FK) │
│ Status (enum)       │      │ + Audit fields          │
│ GlobalRoleId (FK)   │      └──────────┬──────────────┘
│ DefaultCondominiumId│               │ 1:M
│ ThemePreference     │               ▼
│ + Audit fields      │      ┌─────────────────────────┐
└──┬──────────────────┘      │         Block            │
   │                         │─────────────────────────│
   │                         │ Id (Guid, PK)           │
   │                         │ Name                    │
   │                         │ Description             │
   │                         │ TotalUnits              │
   │                         │ IsDefault (bool)        │
   │                         │ CondominiumId (FK)      │
   │                         │ TenantId                │
   │                         │ + Audit fields          │
   │                         └──────────┬──────────────┘
   │                                  │ 1:M
   │                                  ▼
   │                         ┌─────────────────────────┐
   │                         │         Unit             │
   │                         │─────────────────────────│
   │                         │ Id (int, PK)            │
   │                         │ Name                    │
   │                         │ BlockId (FK)            │
   │                         │ UnitTypeId (FK)         │
   │                         │ Floor                   │
   │                         │ Rooms                   │
   │                         │ SquareMeters            │
   │                         │ TenantId                │
   │                         │ + Audit fields          │
   │                         └─────────────────────────┘
   │
   │  ┌───────────────────────────────────────────────────────┐
   │  │          Role-Based Access (Junction Tables)           │
   │  │                                                        │
   │  │  UserRoleCondominium (User ↔ Role ↔ Condominium)      │
   │  │  UserRoleBlock       (User ↔ Role ↔ Block)            │
   │  │  UserRoleUnit        (User ↔ Role ↔ Unit)             │
   │  └───────────────────────────────────────────────────────┘
   │
   │  ┌───────────────────────────────────────────────────────┐
   │  │                    Token Tables                        │
   │  │                                                        │
   │  │  RefreshToken           (UserId FK → User)             │
   │  │  EmailVerificationToken (UserId FK → User)             │
   │  │  PasswordResetToken     (UserId FK → User)             │
   │  └───────────────────────────────────────────────────────┘
   │
   │  ┌───────────────────────────────────────────────────────┐
   │  │              Other User-Related                        │
   │  │                                                        │
   │  │  LoginMechanism (User ↔ auth provider tracking)        │
   │  │  CondominiumInvitation (invitation links)              │
   │  └───────────────────────────────────────────────────────┘
```

## Entity Relationship Diagram - Maintenance & Payments

```
┌─────────────────────────────┐
│       MaintenanceFee         │
│─────────────────────────────│
│ Id (Guid, PK)               │
│ CondominiumId (FK)          │  Scope: condo or block level
│ BlockId (FK, nullable)      │
│ Name                        │  e.g., "Cuota mensual 2026"
│ Amount (decimal)            │  Fixed amount per unit
│ Currency (string)           │
│ Periodicity (enum)          │  Monthly, Quarterly, Semiannual, Annual
│ StartDate                   │
│ EndDate (nullable)          │
│ IsActive (bool)             │
│ TenantId                    │
│ + Audit fields              │
└──────────┬──────────────────┘
           │ 1:M
           ▼
┌─────────────────────────────┐
│     MaintenanceCharge        │
│─────────────────────────────│
│ Id (Guid, PK)               │
│ MaintenanceFeeId (FK)       │  Which fee configuration
│ UnitId (FK)                 │  Which unit owes this
│ PeriodStart                 │  Billing period start
│ PeriodEnd                   │  Billing period end
│ Amount (decimal)            │  Amount after discounts
│ DiscountAmount (decimal)    │  Discount applied (if any)
│ DiscountReason (string?)    │
│ Status (enum)               │  Pending, PartiallyPaid, Paid, Overdue
│ TenantId                    │
│ + Audit fields              │
└──────────┬──────────────────┘
           │ M:1 (many charges per payment)
           ▼
┌─────────────────────────────┐      ┌─────────────────────────┐
│        Payment               │      │    PaymentAttachment     │
│─────────────────────────────│      │─────────────────────────│
│ Id (Guid, PK)               │      │ Id (Guid, PK)           │
│ UserId (FK)                 │  Who paid (owner)              │
│ PaymentType (enum)          │  Maintenance, Reservation      │
│ TotalAmount (decimal)       │      │ PaymentId (FK)          │
│ Currency (string)           │      │ FileName                │
│ ExternalReference (string?) │  Ref from external platform    │
│ PaymentDate (DateTime)      │      │ FilePath                │
│ Notes (string?)             │      │ ContentType             │
│ Status (enum)               │  Pending, Approved, Rejected   │
│ ApprovedById (FK → User?)   │      │ FileSize (long)         │
│ ApprovedAt (DateTime?)      │      │ TenantId                │
│ RejectionReason (string?)   │      │ + Audit fields          │
│ TenantId                    │      └─────────────────────────┘
│ + Audit fields              │
└──────────┬──────────────────┘
           │ M:M via junction
           ▼
┌─────────────────────────────┐
│   PaymentMaintenanceCharge   │
│─────────────────────────────│
│ PaymentId (FK)              │
│ MaintenanceChargeId (FK)    │
│ Amount (decimal)            │  Portion applied to this charge
└─────────────────────────────┘
```

## Entity Relationship Diagram - Common Areas & Reservations

```
┌─────────────────────────────┐
│        CommonArea            │
│─────────────────────────────│
│ Id (Guid, PK)               │
│ Name                        │
│ Description                 │
│ CondominiumId (FK)          │
│ BlockId (FK, nullable)      │  null = condo-level area
│ Capacity (int?)             │
│ HasCost (bool)              │
│ CostAmount (decimal?)       │
│ Currency (string?)          │
│ Rules (string?)             │  Usage rules text
│ IsActive (bool)             │
│ TenantId                    │
│ + Audit fields              │
└──────────┬──────────────────┘
           │ 1:M
           ▼
┌─────────────────────────────┐
│       Reservation            │
│─────────────────────────────│
│ Id (Guid, PK)               │
│ CommonAreaId (FK)           │
│ UserId (FK)                 │  Who reserved
│ ReservationDate (DateTime)  │
│ StartTime (TimeSpan)        │
│ EndTime (TimeSpan)          │
│ Status (enum)               │  Pending, Approved, Rejected, Cancelled
│ CostAmount (decimal?)       │
│ PaymentId (FK, nullable)    │  Links to Payment if cost required
│ Notes (string?)             │
│ TenantId                    │
│ + Audit fields              │
└─────────────────────────────┘
```

## Entity Relationship Diagram - Incidents

```
┌─────────────────────────────┐
│       IncidentType           │
│─────────────────────────────│
│ Id (int, PK)                │
│ Name                        │  Pre-loaded catalog
│ Description                 │
│ IsSystemDefault (bool)      │  true = pre-loaded
│ AssignmentTarget (enum)     │  CondoAdmin, BlockAdmin, Board
│ AllowPublicVisibility (bool)│
│ CondominiumId (FK, nullable)│  null = global default
│ TenantId                    │
│ + Audit fields              │
└──────────┬──────────────────┘
           │ 1:M
           ▼
┌─────────────────────────────┐
│         Incident             │
│─────────────────────────────│
│ Id (Guid, PK)               │
│ IncidentTypeId (FK)         │
│ Title                       │
│ Description                 │
│ ReportedById (FK → User)    │
│ AssignedToId (FK → User?)   │
│ CondominiumId (FK)          │
│ BlockId (FK, nullable)      │
│ Status (enum)               │  Open, InReview, InProgress, Resolved, Closed
│ IsPublic (bool)             │  default: false (private)
│ TenantId                    │
│ + Audit fields              │
└──────────┬──────────────────┘
           │ 1:M
           ▼
┌─────────────────────────────┐
│    IncidentInteraction       │
│─────────────────────────────│
│ Id (Guid, PK)               │
│ IncidentId (FK)             │
│ UserId (FK)                 │
│ Comment (string)            │
│ OldStatus (enum?)           │  Status change tracking
│ NewStatus (enum?)           │
│ TenantId                    │
│ + Audit fields              │
└─────────────────────────────┘
```

## Entity Relationship Diagram - Contacts

```
┌─────────────────────────────┐
│      ContactType             │
│─────────────────────────────│
│ Id (int, PK)                │
│ Name                        │  Dynamic: policía, gasfitero, etc.
│ TenantId (nullable)         │  null = global, else per-condo
│ + Audit fields              │
└──────────┬──────────────────┘
           │ 1:M
           ▼
┌─────────────────────────────┐
│     ImportantContact         │
│─────────────────────────────│
│ Id (Guid, PK)               │
│ ContactTypeId (FK)          │
│ Name                        │
│ PhoneNumber                 │
│ Email (string?)             │
│ Description (string?)       │
│ CondominiumId (FK)          │
│ BlockId (FK, nullable)      │  null = condo-level
│ CreatedByUserId (FK)        │
│ Status (enum)               │  Pending, Approved, Rejected
│ ApprovedById (FK → User?)   │
│ ApprovedAt (DateTime?)      │
│ TenantId                    │
│ + Audit fields              │
└─────────────────────────────┘
```

## Entity Relationship Diagram - Announcements & Notifications

```
┌─────────────────────────────┐      ┌──────────────────────────┐
│       Announcement           │      │  AnnouncementAttachment   │
│─────────────────────────────│      │──────────────────────────│
│ Id (Guid, PK)               │      │ Id (Guid, PK)            │
│ Title                       │      │ AnnouncementId (FK)      │
│ Content (text)              │      │ FileName                 │
│ AuthorId (FK → User)        │      │ FilePath                 │
│ CondominiumId (FK)          │      │ ContentType              │
│ BlockId (FK, nullable)      │  Scope: block or condo         │
│ Scope (enum)                │  Condominium, Block            │
│ TenantId                    │      │ FileSize (long)          │
│ + Audit fields              │      │ TenantId                 │
└─────────────────────────────┘      │ + Audit fields           │
                                     └──────────────────────────┘

┌─────────────────────────────┐
│       Notification           │
│─────────────────────────────│
│ Id (Guid, PK)               │
│ UserId (FK)                 │  Recipient
│ Title                       │
│ Message                     │
│ Type (enum)                 │  Announcement, PaymentApproved, PaymentRejected,
│                             │  IncidentUpdated, ReservationStatus, System
│ ReferenceId (Guid?)         │  Links to source entity
│ ReferenceType (string?)     │  "Announcement", "Payment", "Incident", etc.
│ IsRead (bool)               │
│ ReadAt (DateTime?)          │
│ TenantId                    │
│ + Audit fields              │
└─────────────────────────────┘

┌─────────────────────────────┐
│   CondominiumInvitation      │
│─────────────────────────────│
│ Id (Guid, PK)               │
│ CondominiumId (FK)          │
│ InvitedByUserId (FK)        │
│ Email (string)              │
│ RoleId (FK → Role)          │
│ Token (string)              │  Unique invitation token
│ ExpiresAt (DateTime)        │
│ Status (enum)               │  Pending, Accepted, Expired
│ AcceptedByUserId (FK?)      │
│ TenantId                    │
│ + Audit fields              │
└─────────────────────────────┘
```

## Additional Tables (Existing)

```
┌─────────────────────┐      ┌─────────────────────────┐
│      UnitType        │      │      Permission          │
│─────────────────────│      │─────────────────────────│
│ Id (int, PK)        │      │ Id (int, PK)            │
│ Name                │      │ Code                    │
│ TenantId            │      │ Name                    │
│ + Audit fields      │      │ Description             │
└─────────────────────┘      └─────────────────────────┘

┌─────────────────────┐      ┌─────────────────────────┐
│        Role          │      │    RolePermission        │
│─────────────────────│      │─────────────────────────│
│ Id (string, PK)     │      │ RoleId (FK → Role)      │
│ Name                │      │ PermissionId (FK)       │
│ Description         │      └─────────────────────────┘
│ IsEditable          │
│ RoleLevel (enum)    │      ┌─────────────────────────┐
└─────────────────────┘      │  GlobalRolePermission    │
                             │─────────────────────────│
                             │ GlobalRoleId (FK)       │
                             │ PermissionId (FK)       │
                             └─────────────────────────┘
```

## Base Entity Fields (Audit)

All entities inheriting from `EntityBase<TKey>` include:

| Field | Type | Description |
|-------|------|-------------|
| Id | TKey (int/Guid/string) | Primary key |
| CreatedAt | DateTime | Record creation timestamp |
| ModifiedAt | DateTime? | Last modification timestamp |
| DeletedAt | DateTime? | Soft delete timestamp |
| Active | bool | Active/inactive flag |
| ModifiedById | int? | FK → User who last modified |

Tenant entities additionally include:
| Field | Type | Description |
|-------|------|-------------|
| TenantId | Guid | Condominium tenant identifier |

## Key Constraints

- GUIDs use `NEWSEQUENTIALID()` as default value (SQL Server)
- Global string property max length: 50 characters (convention)
- `ModifiedBy` FK uses `DeleteBehavior.ClientNoAction` (no cascade)
- Soft deletes: records are never physically deleted
- File uploads: validated for type (whitelist), size limits, and content inspection

## Enums

```csharp
// User status
enum UserStatuses { Pending, Active, Inactive, Banned }

// Global roles
enum GlobalRoleTypes { Admin, User }

// Tenant-scoped roles
enum TenantRoleTypes {
    ADMIN, OWNER, TENANT, PRESIDENT, SECRETARY, TREASURER,
    RELATIVE, SECURITY, CLEANING_UNIT, CLEANING_BLOCK, CLEANING_CONDO
}

// Role scope level
enum RoleLevel { Condominium, Block, Unit }

// Login providers
enum LoginMechanismType { Email, Google }

// Catalog types (keyed service resolution)
enum CatalogTypes { Permission, Role }

// Maintenance periodicity
enum Periodicity { Monthly, Quarterly, Semiannual, Annual }

// Maintenance charge status
enum MaintenanceChargeStatus { Pending, PartiallyPaid, Paid, Overdue }

// Payment type
enum PaymentType { Maintenance, Reservation }

// Payment status
enum PaymentStatus { Pending, Approved, Rejected }

// Reservation status
enum ReservationStatus { Pending, Approved, Rejected, Cancelled }

// Incident status
enum IncidentStatus { Open, InReview, InProgress, Resolved, Closed }

// Incident assignment target
enum IncidentAssignmentTarget { CondoAdmin, BlockAdmin, Board }

// Contact approval status
enum ContactApprovalStatus { Pending, Approved, Rejected }

// Announcement scope
enum AnnouncementScope { Condominium, Block }

// Notification type
enum NotificationType {
    Announcement, PaymentApproved, PaymentRejected,
    IncidentUpdated, ReservationStatus, System
}

// Invitation status
enum InvitationStatus { Pending, Accepted, Expired }
```

## Migrations

- Located in: `Condominio_FVDL_API/Migrations/`
- Latest: `20250414201700_update_db2.cs`
- Command: `dotnet ef database update --project Condominio.Persistence --startup-project Condominio_FVDL_API`
