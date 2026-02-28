# Frontend Documentation - Condo_FE

## Project Structure

```
Condo_FE/
├── src/
│   ├── app/
│   │   ├── core/                              # Singleton services & config
│   │   │   ├── auth/
│   │   │   │   ├── guards/
│   │   │   │   │   ├── auth.guard.ts          # Protects authenticated routes
│   │   │   │   │   ├── guest.guard.ts         # Redirects logged-in users
│   │   │   │   │   └── role.guard.ts          # Role-based route protection
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── auth.interceptor.ts    # Bearer token + 401 refresh + tenant header
│   │   │   │   ├── models/
│   │   │   │   │   └── auth.models.ts         # Auth DTOs (requests/responses)
│   │   │   │   └── services/
│   │   │   │       ├── auth.service.ts        # Main auth state & API calls
│   │   │   │       ├── token.service.ts       # Token storage & validation
│   │   │   │       └── google-auth.service.ts # Google Sign-In SDK
│   │   │   ├── services/
│   │   │   │   ├── storage.service.ts         # Platform-aware sessionStorage
│   │   │   │   ├── theme.service.ts           # Dark/light mode (global per user)
│   │   │   │   ├── notification.service.ts    # Notification bell state & API
│   │   │   │   └── condo-context.service.ts   # Current condo + user role context
│   │   │   └── environments/
│   │   │       ├── environment.ts             # apiUrl: https://localhost:7067/api/v1
│   │   │       └── environment.prod.ts        # Production config (TBD)
│   │   ├── layout/                            # Layout components
│   │   │   ├── top-bar/                       # Top navigation bar
│   │   │   │   └── top-bar.component.ts       # App name, user menu, theme, notifs
│   │   │   ├── sidebar/                       # Left sidebar
│   │   │   │   └── sidebar.component.ts       # Role-based menu, role indicator
│   │   │   └── condo-layout/                  # Wrapper: top bar + sidebar + content
│   │   │       └── condo-layout.component.ts
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.ts             # Auth sub-routes
│   │   │   │   └── pages/
│   │   │   │       ├── login/                 # Email/password + Google login
│   │   │   │       ├── register/              # Registration + password strength
│   │   │   │       ├── forgot-password/       # Email input for reset
│   │   │   │       ├── reset-password/        # New password with token
│   │   │   │       └── verify-email/          # Email verification via token
│   │   │   ├── condos/
│   │   │   │   ├── models/
│   │   │   │   │   └── condominium.model.ts   # Condominium, PaginatedResponse<T>
│   │   │   │   ├── services/
│   │   │   │   │   └── condominium.service.ts # Condo API calls
│   │   │   │   ├── components/
│   │   │   │   │   ├── condo-card/            # Card display for each condo
│   │   │   │   │   └── condo-actions/         # Create/Join buttons
│   │   │   │   └── condo-shell/               # Condo selection page (top bar only)
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.page.ts          # Main dashboard (role-based content)
│   │   │   │   └── widgets/                   # Dashboard widgets per role
│   │   │   ├── blocks/
│   │   │   │   ├── blocks.routes.ts
│   │   │   │   ├── pages/                     # Block list, detail, form
│   │   │   │   └── services/
│   │   │   ├── units/
│   │   │   │   ├── units.routes.ts
│   │   │   │   ├── pages/                     # Unit list, detail, residents
│   │   │   │   └── services/
│   │   │   ├── maintenance/
│   │   │   │   ├── maintenance.routes.ts
│   │   │   │   ├── pages/
│   │   │   │   │   ├── fee-config/            # Admin: configure fees
│   │   │   │   │   ├── charges/               # View charges per unit
│   │   │   │   │   └── payment-register/      # Owner: register payment + upload receipt
│   │   │   │   └── services/
│   │   │   ├── common-areas/
│   │   │   │   ├── common-areas.routes.ts
│   │   │   │   ├── pages/
│   │   │   │   │   ├── area-list/             # List common areas
│   │   │   │   │   ├── area-form/             # Admin: create/edit area
│   │   │   │   │   ├── reservations/          # View/create reservations
│   │   │   │   │   └── availability/          # Check availability calendar
│   │   │   │   └── services/
│   │   │   ├── incidents/
│   │   │   │   ├── incidents.routes.ts
│   │   │   │   ├── pages/
│   │   │   │   │   ├── incident-list/         # List incidents (filterable)
│   │   │   │   │   ├── incident-detail/       # Detail + interaction history
│   │   │   │   │   └── incident-form/         # Create/edit incident
│   │   │   │   └── services/
│   │   │   ├── announcements/
│   │   │   │   ├── announcements.routes.ts
│   │   │   │   ├── pages/
│   │   │   │   │   ├── announcement-list/     # List announcements
│   │   │   │   │   ├── announcement-detail/   # Detail with image viewer + downloads
│   │   │   │   │   └── announcement-form/     # Admin: create with attachments
│   │   │   │   └── services/
│   │   │   ├── contacts/
│   │   │   │   ├── contacts.routes.ts
│   │   │   │   ├── pages/
│   │   │   │   │   ├── contact-list/          # Browse approved contacts
│   │   │   │   │   ├── contact-form/          # Submit new contact
│   │   │   │   │   └── contact-approval/      # Admin: approve/reject pending
│   │   │   │   └── services/
│   │   │   └── notifications/
│   │   │       ├── pages/
│   │   │       │   └── notification-center/   # All notifications list
│   │   │       └── components/
│   │   │           └── notification-bell/     # Bell icon + dropdown in top bar
│   │   ├── shared/
│   │   │   ├── validators/
│   │   │   │   └── password.validators.ts     # strongPassword + passwordMatch
│   │   │   ├── components/
│   │   │   │   ├── file-upload/               # Reusable file upload (receipts, attachments)
│   │   │   │   ├── status-badge/              # Status indicator badge
│   │   │   │   ├── confirm-dialog/            # Confirmation modal
│   │   │   │   ├── empty-state/               # Empty list placeholder
│   │   │   │   └── pagination/                # Reusable pagination control
│   │   │   └── pipes/
│   │   │       ├── date-format.pipe.ts        # Localized date formatting
│   │   │       ├── currency.pipe.ts           # Currency formatting
│   │   │       └── status-label.pipe.ts       # Status enum → display label
│   │   ├── app.ts                             # Root component
│   │   ├── app.routes.ts                      # Main routing config
│   │   ├── app.config.ts                      # provideHttpClient, provideRouter
│   │   └── app.config.server.ts               # SSR config
│   ├── main.ts                                # Browser bootstrap
│   ├── main.server.ts                         # SSR bootstrap
│   ├── server.ts                              # Express SSR server
│   ├── styles.css                             # Tailwind + DaisyUI imports
│   └── index.html                             # HTML entry (lang="es")
├── package.json
├── angular.json
├── tsconfig.json
└── .postcssrc.json                            # Tailwind v4 PostCSS config
```

## Routing

```
/                                    → Redirects to /auth/login
/auth                                → Lazy-loaded AUTH_ROUTES
  /auth/login                        → LoginPage              [guestGuard]
  /auth/register                     → RegisterPage            [guestGuard]
  /auth/forgot-password              → ForgotPasswordPage      [guestGuard]
  /auth/reset-password               → ResetPasswordPage       [no guard, token-based]
  /auth/verify-email                 → VerifyEmailPage         [no guard, token-based]
/condos                              → CondoShellComponent      [authGuard] (top bar only)
/condos/:condoId                     → CondoLayout (top bar + sidebar) [authGuard]
  /condos/:condoId/dashboard         → DashboardPage           [authGuard]
  /condos/:condoId/blocks            → Block routes             [authGuard, roleGuard]
  /condos/:condoId/units             → Unit routes              [authGuard, roleGuard]
  /condos/:condoId/maintenance       → Maintenance routes       [authGuard, roleGuard]
  /condos/:condoId/common-areas      → Common area routes       [authGuard, roleGuard]
  /condos/:condoId/incidents         → Incident routes          [authGuard]
  /condos/:condoId/announcements     → Announcement routes      [authGuard]
  /condos/:condoId/contacts          → Contact routes           [authGuard]
  /condos/:condoId/notifications     → Notification center      [authGuard]
/invitations/accept                  → Accept invitation page   [no guard, token-based]
**                                   → Redirects to /auth/login
```

## Navigation Structure

### Unauthenticated (Auth pages)
- No navigation menu
- Centered card layout

### Condo Selection (`/condos`)
- **Top bar only:**
  - Left: App logo + name ("CondoGestApp")
  - Right: Notification bell, theme toggle (sun/moon), user avatar + dropdown menu
  - User dropdown: Profile, Preferences, Logout

### Inside Condominium (`/condos/:condoId/*`)
- **Top bar** (same as selection + current condo name)
- **Left sidebar:**
  - User role badge (e.g., "Administrador", "Propietario")
  - Menu items based on role:
    - **All roles:** Dashboard, Comunicados, Contactos, Incidentes, Notificaciones
    - **Admin:** + Bloques, Unidades, Mantenimiento (config), Áreas Comunes (config), Aprobaciones
    - **Owner:** + Mis Unidades, Pagos, Mis Reservas
    - **Tenant:** + Mi Unidad, Mis Reservas
  - "Cambiar condominio" link at bottom (navigates back to `/condos`)

## State Management

Signal-based (no NgRx):

```typescript
// AuthService (singleton)
currentUser = signal<UserSummaryResponse | null>(null);
isAuthenticated = computed(() => !!this.currentUser());

// TokenService (singleton)
private accessToken: string | null;          // In-memory
private accessTokenExpiresAt: number | null; // In-memory
// Refresh token → sessionStorage("rt")
// Remember-me → sessionStorage("rm")

// CondoContextService (singleton)
currentCondo = signal<CondominiumResponse | null>(null);
currentRole = signal<string | null>(null);      // e.g., "ADMIN", "OWNER"
condoId = computed(() => this.currentCondo()?.id);

// ThemeService (singleton)
isDarkMode = signal<boolean>(false);             // Persisted per user
// Applies 'dark' or 'cupcake' DaisyUI theme to <html> data-theme

// NotificationService (singleton)
unreadCount = signal<number>(0);
notifications = signal<Notification[]>([]);

// Components (local signals)
loading = signal(false);
errorMessage = signal('');
success = signal(false);
```

## Authentication Architecture

### Token Flow
```
Login/Register → LoginResponse { accessToken, expiresIn, refreshToken, user }
                      │
                      ├─ accessToken → stored in-memory (TokenService)
                      ├─ refreshToken → stored in sessionStorage
                      └─ user → stored in currentUser signal

Auto-refresh: scheduled (expiresIn - 60s) before expiry
On 401: interceptor → executeRefresh() → retry request
On refresh failure: logout + redirect to /auth/login
```

### Interceptor Logic
1. Skip public paths (`/auth/login`, `/auth/register`, `/auth/refresh-token`, etc.)
2. Add `Authorization: Bearer {token}` if token exists
3. Add `x-empresa-id: {condoId}` header if condo context is set
4. On 401 error:
   - If refresh token available → call `executeRefresh()`
   - Single-flight pattern: only one refresh at a time, queue other requests
   - On success → retry original request with new token
   - On failure → logout

### Google OAuth
- Loads Google Sign-In SDK dynamically
- Renders Google button in login page container
- Receives JWT credential → sends to backend `/auth/google-login`
- Backend validates with Google, creates/links user, returns app tokens

## Theme System

```typescript
// ThemeService
@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDarkMode = signal(false);

  toggleTheme(): void {
    this.isDarkMode.update(v => !v);
    // Apply to <html data-theme="dark"> or <html data-theme="cupcake">
    // Persist preference via PATCH /users/me/preferences
  }

  initTheme(userPreference: boolean): void {
    this.isDarkMode.set(userPreference);
  }
}
```

- Light theme: DaisyUI "cupcake" (primary accent `#4a6785`)
- Dark theme: DaisyUI "dark"
- Theme preference stored in user profile (backend)
- Applied globally via `data-theme` attribute on `<html>` element

## Components

### Auth Pages
All auth pages follow the same pattern:
- Reactive Forms with validators
- `loading`, `errorMessage`, `success` signals for UI state
- DaisyUI card layout with form controls
- Spanish-language UI text

### Condo Feature
- **CondoShellComponent:** Main condo selection view. Fetches user's condominiums, displays grid of CondoCards. If only 1 condo → auto-redirect to dashboard.
- **CondoCardComponent:** Presentational card with condo info. Input: `condo`, Output: `select` event.
- **CondoActionsComponent:** Create/Join action buttons. Outputs: `create`, `join` events.

### Layout Components
- **TopBarComponent:** Horizontal navbar with app branding, notification bell (with unread badge), theme toggle, user avatar with dropdown menu.
- **SidebarComponent:** Left sidebar with role-based navigation. Receives current role via `CondoContextService`. Collapsible on mobile.
- **CondoLayoutComponent:** Wrapper that renders top bar + sidebar + `<router-outlet>` for condo-scoped content.

### Shared Components
- **FileUploadComponent:** Drag & drop or click to upload. Validates file type/size client-side. Shows preview for images. Emits file on selection.
- **StatusBadgeComponent:** Colored badge for statuses (Pending=yellow, Approved=green, Rejected=red, etc.)
- **ConfirmDialogComponent:** DaisyUI modal for destructive action confirmation.
- **PaginationComponent:** Reusable pagination with page size selector.

### Dashboard
- Role-based dashboard with widgets
- **Admin view:** Pending approvals count, recent payments, occupancy stats
- **Owner view:** My charges summary, recent announcements, my incidents
- **Tenant view:** Upcoming reservations, recent announcements

## Styling Conventions

- **Framework:** Tailwind CSS v4 + DaisyUI v5
- **Themes:** DaisyUI "cupcake" (light) / "dark" (dark mode)
- **Primary accent:** `#4a6785` (teal) for buttons and actions
- **Components:** DaisyUI classes (`btn`, `card`, `input`, `alert`, `navbar`, `drawer`, `menu`, etc.)
- **Layout:** Tailwind utilities (`flex`, `grid`, `p-*`, `m-*`, responsive prefixes)
- **Responsive:** Mobile-first with `sm:`, `md:`, `lg:` breakpoints
- **Sidebar:** DaisyUI `drawer` component (responsive: overlay on mobile, fixed on desktop)

## Validators

```typescript
// strongPasswordValidator() — returns { strongPassword: { ... } }
// Checks: minLength(8), hasLowercase, hasUppercase, hasDigit, hasSpecialChar

// passwordMatchValidator(passwordField, confirmField) — FormGroup validator
// Sets 'passwordMismatch' error on confirm field if values differ
```

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @angular/* | 21.1.0 | Framework |
| rxjs | 7.8.0 | Reactive programming |
| tailwindcss | 4.1.12 | Utility CSS |
| daisyui | 5.5.18 | UI components |
| typescript | 5.9.2 | Language |
| express | 5.1.0 | SSR server |

## SSR Configuration

- Server entry: `src/server.ts` (Express)
- Auth routes rendered client-side only
- Static routes prerendered
- Platform-aware services check `isPlatformBrowser` before accessing browser APIs
