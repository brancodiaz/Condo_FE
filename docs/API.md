# API Endpoints Reference

Base URL: `https://localhost:7067/api/v1`

## Authentication (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user account |
| POST | `/auth/login` | No | Login with email/password |
| POST | `/auth/google-login` | No | Login with Google OAuth token |
| POST | `/auth/refresh-token` | No | Refresh access token |
| GET | `/auth/verify-email?email=&token=` | No | Verify email address |
| POST | `/auth/resend-verification-email` | No | Resend verification email |
| POST | `/auth/forgot-password/{email}` | No | Request password reset |
| POST | `/auth/reset-password` | No | Reset password with token |
| POST | `/auth/logout` | Bearer | Logout (invalidate tokens) |

## Roles (`/roles`) — superadmin only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/roles/{id}` | Get role by ID |
| GET | `/roles` | List all roles (paginated) |
| POST | `/roles` | Create role |
| PUT | `/roles/{id}` | Update role |
| DELETE | `/roles/{id}` | Delete role |

## Permissions (`/permissions`) — superadmin only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/permissions/{id}` | Get permission by ID |
| GET | `/permissions` | List all permissions (paginated) |
| POST | `/permissions` | Create permission |
| PUT | `/permissions/{id}` | Update permission |
| DELETE | `/permissions/{id}` | Delete permission |

## Condominiums (`/condominiums`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/condominiums/{id}` | Get condominium details |
| GET | `/condominiums` | List condominiums (paginated) |
| POST | `/condominiums` | Create condominium (creator becomes admin) |
| PUT | `/condominiums/{id}` | Update condominium |
| DELETE | `/condominiums/{id}` | Delete condominium |

## Condominium Members & Invitations (`/condominiums/{condoId}/members`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/condominiums/{condoId}/members` | List members (paginated) |
| POST | `/condominiums/{condoId}/members` | Add member manually (with role) |
| PUT | `/condominiums/{condoId}/members/{userId}` | Update member role |
| DELETE | `/condominiums/{condoId}/members/{userId}` | Remove member |
| POST | `/condominiums/{condoId}/invitations` | Send invitation link (email + role) |
| GET | `/condominiums/{condoId}/invitations` | List pending invitations |
| DELETE | `/condominiums/{condoId}/invitations/{id}` | Cancel invitation |
| POST | `/invitations/accept?token=` | Accept invitation (public) |

## Condominium Units (`/condominiums/units`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/condominiums/units/{id}` | Get unit by ID |
| GET | `/condominiums/units` | List all units (paginated) |
| POST | `/condominiums/units` | Create unit |
| PUT | `/condominiums/units/{id}` | Update unit |
| DELETE | `/condominiums/units/{id}` | Delete unit |
| GET | `/condominiums/units/paged-summary` | Paginated unit summary |
| GET | `/condominiums/units/summary` | Full unit summary |

## Blocks (`/blocks`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/blocks/{id}` | Get block by ID |
| GET | `/blocks` | List blocks (paginated) |
| POST | `/blocks` | Create block |
| PUT | `/blocks/{id}` | Update block |
| DELETE | `/blocks/{id}` | Delete block |
| GET | `/blocks/combo-list` | Dropdown list |

## Units within Blocks (`/blocks/{blockId}/units`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/blocks/{blockId}/units/{id}` | Get unit by ID |
| GET | `/blocks/{blockId}/units` | List units in block (paginated) |
| POST | `/blocks/{blockId}/units` | Create unit in block |
| PUT | `/blocks/{blockId}/units/{id}` | Update unit |
| DELETE | `/blocks/{blockId}/units/{id}` | Delete unit |

## Unit Types (`/unittypes`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/unittypes/{id}` | Get unit type by ID |
| GET | `/unittypes` | List unit types (paginated) |
| POST | `/unittypes` | Create unit type |
| PUT | `/unittypes/{id}` | Update unit type |
| DELETE | `/unittypes/{id}` | Delete unit type |
| GET | `/unittypes/combo-list` | Dropdown list |

## Unit Persons (`/blocks/{blockId}/units/{unitId}/persons`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/blocks/{blockId}/units/{unitId}/persons/{id}` | Get person |
| GET | `/blocks/{blockId}/units/{unitId}/persons` | List persons (paginated) |
| GET | `/blocks/{blockId}/units/{unitId}/persons/all` | List all persons |
| POST | `/blocks/{blockId}/units/{unitId}/persons` | Add person to unit |
| PUT | `/blocks/{blockId}/units/{unitId}/persons/{id}` | Update person |
| DELETE | `/blocks/{blockId}/units/{unitId}/persons/{id}` | Remove person |

## Users (`/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | Get current user profile |
| PATCH | `/users/me` | Update own info |
| POST | `/users/me/change-password` | Change password |
| PATCH | `/users/me/preferences` | Update preferences (theme, etc.) |
| DELETE | `/users/me` | Delete account |

## Maintenance Fees (`/maintenance-fees`) — admin only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/maintenance-fees` | List fee configurations (paginated) |
| GET | `/maintenance-fees/{id}` | Get fee configuration details |
| POST | `/maintenance-fees` | Create fee configuration |
| PUT | `/maintenance-fees/{id}` | Update fee configuration |
| DELETE | `/maintenance-fees/{id}` | Deactivate fee configuration |

## Maintenance Charges (`/maintenance-charges`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/maintenance-charges` | List charges (paginated, filterable by unit/status/period) |
| GET | `/maintenance-charges/{id}` | Get charge details |
| POST | `/maintenance-charges/generate` | Generate charges for a period (admin) |
| PUT | `/maintenance-charges/{id}` | Update charge (admin, e.g., apply discount) |
| GET | `/maintenance-charges/unit/{unitId}` | Get charges for a specific unit |
| GET | `/maintenance-charges/summary` | Get summary (total owed, paid, pending) |

## Payments (`/payments`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments` | List payments (paginated, filterable) |
| GET | `/payments/{id}` | Get payment details |
| POST | `/payments` | Register payment (multipart: data + optional receipt) |
| PUT | `/payments/{id}/approve` | Approve payment (admin) |
| PUT | `/payments/{id}/reject` | Reject payment with reason (admin) |
| GET | `/payments/{id}/attachment` | Download payment receipt |
| GET | `/payments/pending` | List pending payments for approval (admin) |

## Common Areas (`/common-areas`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/common-areas` | List common areas (paginated) |
| GET | `/common-areas/{id}` | Get common area details |
| POST | `/common-areas` | Create common area (admin) |
| PUT | `/common-areas/{id}` | Update common area (admin) |
| DELETE | `/common-areas/{id}` | Deactivate common area (admin) |

## Reservations (`/reservations`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reservations` | List reservations (paginated, filterable by area/date/status) |
| GET | `/reservations/{id}` | Get reservation details |
| POST | `/reservations` | Create reservation request |
| PUT | `/reservations/{id}/approve` | Approve reservation (admin) |
| PUT | `/reservations/{id}/reject` | Reject reservation (admin) |
| PUT | `/reservations/{id}/cancel` | Cancel reservation (user or admin) |
| GET | `/reservations/availability` | Check availability for a common area + date |

## Incidents (`/incidents`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/incidents` | List incidents (paginated, filterable by type/status/visibility) |
| GET | `/incidents/{id}` | Get incident details with interaction history |
| POST | `/incidents` | Create incident |
| PUT | `/incidents/{id}` | Update incident (title, description, visibility) |
| PUT | `/incidents/{id}/status` | Change incident status (assigned user/admin) |
| PUT | `/incidents/{id}/assign` | Assign incident to user (admin) |
| PUT | `/incidents/{id}/reopen` | Reopen a resolved/closed incident |
| POST | `/incidents/{id}/interactions` | Add interaction/comment |
| GET | `/incidents/{id}/interactions` | Get interaction history |

## Incident Types (`/incident-types`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/incident-types` | List incident types (includes system defaults + condo custom) |
| GET | `/incident-types/{id}` | Get incident type details |
| POST | `/incident-types` | Create custom incident type (admin) |
| PUT | `/incident-types/{id}` | Update incident type config (admin) |
| DELETE | `/incident-types/{id}` | Deactivate custom incident type (admin) |

## Important Contacts (`/contacts`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contacts` | List approved contacts (paginated, filterable by type) |
| GET | `/contacts/{id}` | Get contact details |
| POST | `/contacts` | Submit contact (status: pending) |
| PUT | `/contacts/{id}` | Update contact (creator or admin) |
| DELETE | `/contacts/{id}` | Delete contact (admin) |
| PUT | `/contacts/{id}/approve` | Approve contact (admin) |
| PUT | `/contacts/{id}/reject` | Reject contact (admin) |
| GET | `/contacts/pending` | List pending contacts for approval (admin) |

## Contact Types (`/contact-types`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contact-types` | List contact types |
| POST | `/contact-types` | Create contact type (auto-created if new type submitted) |

## Announcements (`/announcements`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/announcements` | List announcements (paginated) |
| GET | `/announcements/{id}` | Get announcement with attachments |
| POST | `/announcements` | Create announcement (multipart: data + files) (admin) |
| PUT | `/announcements/{id}` | Update announcement (admin) |
| DELETE | `/announcements/{id}` | Delete announcement (admin) |
| GET | `/announcements/{id}/attachments/{attachmentId}` | Download attachment |

## Notifications (`/notifications`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List user notifications (paginated) |
| GET | `/notifications/unread-count` | Get unread notification count |
| PUT | `/notifications/{id}/read` | Mark notification as read |
| PUT | `/notifications/read-all` | Mark all notifications as read |
| DELETE | `/notifications/{id}` | Delete notification |

## Common Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `pageNumber` | int | Page number (default: 1) |
| `pageSize` | int | Items per page (default: 10) |

## Standard Response Formats

### Paginated Response
```json
{
  "items": [...],
  "pageNumber": 1,
  "pageSize": 10,
  "totalCount": 50,
  "totalPages": 5
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error description"
}
```

### Login Response
```json
{
  "accessToken": "eyJ...",
  "expiresIn": 43200,
  "refreshToken": "abc123...",
  "user": {
    "id": 1,
    "firstName": "John",
    "fullName": "John Doe",
    "email": "john@example.com",
    "roles": [{ "roleId": "User", "roleDescription": "User" }]
  },
  "message": "Login successful"
}
```

## Swagger Documentation

| Doc Group | URL |
|-----------|-----|
| Default (v1) | `/swagger/v1/swagger.json` |
| Condominiums | `/swagger/condominiums/swagger.json` |
| Auth | `/swagger/auth/swagger.json` |
| Public | `/swagger/public/swagger.json` |
| Swagger UI | `/swagger/index.html` |
