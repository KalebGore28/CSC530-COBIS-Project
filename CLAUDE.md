# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

COBIS (College Business Information System) is a full-stack TypeScript application for managing student data, courses, advisors, and academic information at Murray State University. Built with TanStack Start (React meta-framework), it features role-based access control, real-time data synchronization, and a sophisticated permission system.

## Tech Stack

- **Framework**: React 19 with TanStack Start (SSR meta-framework)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + Shadcn UI components
- **Data Layer**: TanStack Query + TanStack DB (client-side reactive database)
- **Database**: MySQL with Drizzle ORM
- **Authentication**: Better Auth (Google OAuth only, `murraystate.edu` domain restricted)
- **Runtime**: Bun (production server)

## Commands

### Development

```bash
bun dev              # Start dev server on port 3000
bun test             # Run all tests with Vitest
bun lint             # Lint with OxLint (type-aware)
bun lint:fix         # Auto-fix linting issues
bun format           # Format with Prettier
bun check            # Format + lint in one command
```

### Database

```bash
bun db:studio        # Open Drizzle Studio (database GUI)
bun db:gen           # Generate migrations from schema changes
bun db:mig           # Run pending migrations
bun db:seed          # Seed database with CSV data
```

### Build & Deploy

```bash
bun build            # Build for production
bun serve            # Preview production build
bun server.ts        # Run custom Bun production server
```

### Docker

```bash
bun docker:build     # Build Docker image
bun docker:run       # Run containerized app
```

## Architecture Overview

### Three-Layer Data Flow

The application uses a unique three-tier data system:

1. **MySQL Database** (source of truth) → Drizzle ORM
2. **API Layer** (`/api/__protected/data/*`) → Permission-filtered REST endpoints with gzip compression
3. **TanStack DB Collections** → Client-side reactive in-memory database

**Flow**: User Action → Component → `useLiveQuery()` → TanStack DB Collection → Fetch API → Server Route → Middleware (auth/permissions) → Database → Gzipped Response → Query Cache → Collection → Component Re-render

### Routing Structure (File-Based)

Routes mirror the file structure in `src/routes/`:

- **`_authenticated.tsx`** - Auth guard (redirects unauthenticated users)
- **`_layout.tsx`** - Main app layout (sidebar, header)
- **Underscore prefix (`_`)** - Layout routes (no URL segment)
- **Dollar sign (`$`)** - Dynamic segments (e.g., `instructors/$mnumber/`)
- **`index.tsx`** - Default child route

Example routing structure:

```
/dashboard                    → _authenticated/_layout/dashboard/index.tsx
/instructors/M12345           → _authenticated/_layout/instructors/$mnumber/index.tsx
/api/data/students            → api/__protected/data/students.ts
```

### API Patterns

All student data endpoints follow this pattern:

```typescript
// 1. Get accessible students based on user's roles
const access = await getStudentAccessLevel(context.user, context.roles)

// 2. Filter query by accessible students
const results = await context.db
    .select()
    .from(students)
    .where(inArray(students.mnumber, Array.from(access.students)))

// 3. Gzip compress for large datasets
const compressed = gzipSync(Buffer.from(JSON.stringify(results)))

// 4. Return with proper headers
return new Response(compressed, {
    headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
    },
})
```

### TanStack DB Collections

Collections provide reactive client-side queries with SQL-like syntax:

```typescript
// Define collection (src/integrations/tanstack-db/students.ts)
export const studentsCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['students'],
        queryFn: async () => fetch('/api/data/students').then((r) => r.json()),
        getKey: (student) => student.mnumber,
    }),
)

// Use in components with live queries
const { data } = useLiveQuery((q) =>
    q
        .from({ students: studentsCollection })
        .where(({ students }) => eq(students.department_id, 'CS'))
        .select(({ students }) => students),
)
```

Benefits: Client-side joins, instant queries, automatic re-renders, offline-first.

## Permission System (Critical)

The app has a sophisticated role-based access control system. **All student data endpoints MUST filter by accessible students.**

### Access Levels

Defined in `src/utils/get-student-access-level.ts`:

- **`LIMITED`** - Basic info only (no grades/GPA)
- **`COURSE_SCOPED`** - Grades for specific courses only
- **`FULL`** - All student data including GPA

### Role Hierarchy (lowest to highest access)

1. **Admin Assistant** - Students in their department, LIMITED access
2. **Faculty/Instructor** - Students in their courses, COURSE_SCOPED access
3. **Department Chair** - All department students, COURSE_SCOPED/FULL access
4. **Program Coordinator** - Students in their programs, FULL access
5. **Advisor** - All advisees, FULL access
6. **COBIS Administrator** - System-wide access (but still needs other roles for student data)

### Using Access Control

```typescript
// Get accessible students
const access = await getStudentAccessLevel(context.user, context.roles)
    // access.students - Set<string> of accessible student mnumbers
    // access.terms - Map of term-specific access levels
    // access.timestamp - Cache timestamp (5-minute TTL)

    // Always filter queries
    .where(inArray(students.mnumber, Array.from(access.students)))

// Check term-specific access for grade data
const termAccess = access.terms.get(`${mnumber}:${year}-${termId}`)
if (termAccess?.accessLevel === 'LIMITED') {
    // Strip grades
}
```

## Database Schema (Drizzle ORM)

All tables defined in `src/db/schema.ts`:

### Key Tables

- **Better Auth**: `user`, `session`, `account`, `verification`
- **Students**: `students`, `studentPrograms`, `studentCourses`, `studentAdvisors`, `studentAcademicInfo`
- **Academic**: `courses`, `faculty`, `terms`, `departments`, `colleges`, `programs`
- **Lookup**: `academicStanding`, `admitCodes`, `coursePrefixes`, `instructionalMethods`, `partOfTerm`, `registrationStatus`
- **Roles**: `roles`, `userRoles`

### Important Patterns

- **Composite keys**: Many tables use `(mnumber, term_id, year)` as unique constraint
- **Term-scoped data**: Most student data is scoped to specific terms (format: `202510` = Fall 2025)
- **Snake case**: Drizzle configured with `casing: 'snake_case'`
- **Type inference**: Use `typeof students.$inferSelect` for type-safe queries

## Authentication Flow (Better Auth)

1. User clicks "Sign in with Google"
2. Google OAuth verifies domain (must be `murraystate.edu`)
3. Better Auth creates session
4. New users start with `isEnabled: false`, no `mnumber`
5. COBIS admin assigns `mnumber` and enables account
6. User gains access based on assigned roles

### Server Context

All server routes/middleware have access to:

```typescript
context.db // Drizzle database instance
context.auth // Better Auth instance
context.user // Current user (id, email, name, mnumber, isEnabled)
context.session // Session info
context.faculty // Faculty record (firstName, lastName, department_id)
context.roles // Set<string> of role names
```

### Middleware Chain

Middleware can compose and run sequentially:

```typescript
export const requireCobisAdmin = createMiddleware()
    .middleware([loadUser, isEnabled]) // Run these first
    .server(async ({ context }) => {
        if (!context.roles.has('cobis_administrator')) {
            throw redirect({ to: '/dashboard' })
        }
    })
```

## Key Directories

- **`src/routes/`** - File-based routes (structure = URLs)
- **`src/routes/api/__protected/data/`** - Data API endpoints (20 tables)
- **`src/components/ui/`** - Shadcn UI components
- **`src/components/tables/`** - Editable data tables
- **`src/integrations/tanstack-db/`** - TanStack DB collections (one per table)
- **`src/db/`** - Database layer (schema, relations, migrations)
- **`src/middleware/`** - Server middleware (auth checks, user loading)
- **`src/utils/access-checks/`** - Role-specific access logic
- **`src/utils/csv-importer/`** - CSV import system for bulk data

## Important Conventions

### Path Aliases

```typescript
import { ... } from '@/...'  // Maps to src/
```

### Server vs Client Code

- **Server-only**: `src/routes/api/`, `src/middleware/`, `src/functions/`
- **Client-only**: `src/components/`, `src/hooks/`, `src/providers/`
- **Hybrid**: Route files (have both `beforeLoad` and `component`)

### Route Guards

Use `beforeLoad` hook for auth checks and redirects:

```typescript
export const Route = createFileRoute('/cobis-tools')({
    beforeLoad: async ({ context }) => {
        if (!context.roles.has('cobis_administrator')) {
            throw redirect({ to: '/dashboard' })
        }
    },
})
```

### Collection Preloading

Small collections should be preloaded in layouts:

```typescript
beforeLoad: () => {
    void currentTermCollection.preload() // Fire and forget
}
```

Large collections (students, courses) load on-demand.

## Critical Patterns & Gotchas

### 1. Always Filter Student Data by Access

**Every** student data endpoint must call `getStudentAccessLevel()` and filter results. Never expose student data without permission checks.

### 2. ClientOnly Wrapper for Authenticated Layouts

Prevents hydration mismatches:

```typescript
<ClientOnly>
  <Outlet />
</ClientOnly>
```

### 3. Middleware Order Matters

Dependencies must run first:

```typescript
.middleware([loadUser, isEnabled])  // loadUser MUST run before isEnabled
```

### 4. Don't Edit `routeTree.gen.ts`

This file is auto-generated by `@tanstack/router-plugin`. Changes are overwritten on rebuild.

### 5. Gzip Compression for Large Datasets

Student and course endpoints use gzip compression. Always include proper headers.

### 6. Term Format

Terms use format: `YYYYTT` where `TT` is term code:

- `10` = Spring
- `50` = Summer
- `80` = Fall
- `90` = Winter

Example: `202580` = Fall 2025

### 7. Access Cache Has 5-Minute TTL

Permission cache expires after 5 minutes. Call `invalidateAccessCache()` when roles change.

## Adding New Features

### Adding a New Database Table

1. Add table to `src/db/schema.ts`
2. Run `bun db:gen` to generate migration
3. Run `bun db:mig` to apply migration
4. Create API endpoint in `src/routes/api/__protected/data/`
5. Create collection in `src/integrations/tanstack-db/`
6. Add to preload in layout if small dataset

### Adding a New Route

1. Create file in `src/routes/` (structure = URL)
2. Router auto-generates types in `routeTree.gen.ts`
3. Add `beforeLoad` for auth/permission checks
4. Implement `component` for UI

### Adding a New Role

1. Add role to `roles` table via seed or manual insert
2. Update role checks in `src/utils/access-checks/`
3. Update `getStudentAccessLevel()` if needed
4. Add route guards using new role

## Testing

- **Framework**: Vitest with `@testing-library/react`
- **Run tests**: `bun test`
- **Test files**: Located in `/test/`

## Environment Variables

Required variables (see `.env.example`):

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`
- `TRUSTED_ORIGIN`

## Production Deployment

The custom Bun server (`server.ts`) provides:

- Asset preloading for small files
- Automatic gzip compression
- ETag caching support
- Hybrid static + dynamic routing

Run with: `bun server.ts` (not `bun serve`)
