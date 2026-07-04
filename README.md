# Alrehla Workspace

Alrehla is an Arabic educational marketplace and learning platform built with React, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router, and Supabase.

The project is now organized as a monorepo so the public marketplace and admin dashboard can evolve independently while sharing UI, API, auth, types, config, and utility code.

## Workspace Structure

```text
alrehla-workspace/
├── apps/
│   ├── marketplace/      # Public site, store, ordering, checkout, parent/student flows
│   └── admin-panel/      # Separate admin, instructor, publisher, reporting, settings app
├── packages/
│   ├── ui/               # Shared presentational components only
│   ├── api/              # Supabase client and database/API services
│   ├── auth/             # Roles, permissions, RBAC helpers
│   ├── types/            # Shared domain and generated database types
│   ├── config/           # Shared constants and app configuration
│   └── utils/            # Date, money, text, slug, validation helpers
├── supabase/             # Reusable setup and seed SQL files
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── eslint.config.js
└── prettier.config.js
```

## Apps

### `apps/marketplace`

Contains the public Arabic marketplace portal, blog/content pages, Enha Lak store, personalized story ordering flow, creative writing booking flow, cart and checkout, parent account area, and student/session pages that remain part of the customer-facing product.

The marketplace no longer owns admin routes. Staff/admin links should open the separate admin panel using `VITE_ADMIN_PANEL_URL`.

### `apps/admin-panel`

A separate React/Vite admin application. It contains the old admin, instructor, publisher, reporting, audit, settings, scheduling, financial, and product management pages. Routes are mounted from the admin app root instead of `/admin/*`.

Frontend route guards use shared RBAC helpers from `packages/auth`. Database authorization must still be enforced by Supabase RLS and backend policies.

## Shared Packages

- `@alrehla/ui`: shared Button, Input, Modal, Table, Badge/Card-style primitives, Toast, loading/error components, and other presentational UI. No Supabase or business data access belongs here.
- `@alrehla/api`: Supabase client plus auth, user, order, booking, content, reporting, settings, storage, communication, and admin-facing services.
- `@alrehla/auth`: role definitions, permission matrix, and helpers such as `hasPermission`, `isAdminRole`, and `canAccessAdmin`.
- `@alrehla/types`: generated Supabase database types and shared domain models.
- `@alrehla/config`: shared constants, environment-backed config, and reusable seed/mock configuration.
- `@alrehla/utils`: formatting, validation, pricing, Arabic text, date, and helper functions.

## Environment Files

Each app owns its own environment file:

```text
apps/marketplace/.env
apps/admin-panel/.env
```

Common variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_cloudinary_api_key
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

Marketplace-only admin bridge:

```env
VITE_ADMIN_PANEL_URL=http://localhost:3001
```

## Setup

Use pnpm for the workspace:

```bash
pnpm install
```

## Scripts

```bash
pnpm dev                # run all dev apps through Turbo
pnpm dev:marketplace    # marketplace on port 3000
pnpm dev:admin          # admin panel on port 3001
pnpm build              # build all apps/packages
pnpm lint               # lint all apps/packages
pnpm typecheck          # typecheck all apps/packages
```

You can also run scripts inside a specific app:

```bash
pnpm --filter @alrehla/marketplace dev
pnpm --filter @alrehla/admin-panel dev
```

## Database

Supabase SQL files live in `supabase/`:

- `00_setup.sql`: reusable schema, functions, policies, and storage setup
- `01_seed.sql`: reusable seed content and demo data

Do not enforce admin security only in React. Supabase RLS and database policies remain the source of truth for data access.
