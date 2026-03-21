# Conventions

## Tech Stack

- **Language:** JavaScript with JSDoc (no TypeScript in implementation, types only)
- **Runtime:** Node.js
- **Package Manager:** npm workspaces
- **Approach:** Spec Driven Development (SDD) with Test Driven Development (TDD)

## Project Structure

```
├── apps/
│   └── <app_name>/           # Frontend and backend apps (start a server or process)
├── packages/
│   └── <package_name>/       # Agnostic packages (shared utils, DB, UI components)
├── domain/
│   └── backend/
│       └── <domain_name>/     # Domain related to backend
│   └── frontend/
│       └── <domain_name>/     # Domain related to frontend
├── types/
│   └── backend/
│       └── <package_name>/   # Types related to backend
│   └── frontend/
│       └── <package_name>/   # Types related to frontend
│   └── shared/
│       └── <package_name>/   # Shared types
├── prisma/                   # Prisma models
└── specs/                    # Feature specifications
```

## Filename Convention

All files must use kebab-case (e.g., `auth-plugin.js`, `index.js`, `my-component.svelte`).

## Package Name Convention

- Apps: `@tms/app-<name>`
- Domain Backend: `@tms/domain-backend-<name>`
- Domain Frontend: `@tms/domain-frontend-<name>`
- Types Backend: `@tms/types-backend-<name>`
- Types Frontend: `@tms/types-frontend-<name>`
- Types Shared: `@tms/types-shared-<name>`
- Packages: `@tms/package-<name>`
