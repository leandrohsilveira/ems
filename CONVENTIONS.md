# Conventions

## Project Structure

The project structure should match the following convention:

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
│   └── shared/
│       └── <package_name>/    # Shared domain
├── prisma/                   # Prisma models
├── specs/                    # Feature specifications
└── plans/                    # Implementation plans and decisions
```

## Filename Convention

All files must use kebab-case (e.g., `auth-plugin.js`, `index.js`, `my-component.svelte`).

Also, files can have suffixes like `service`, `api`, `repository` that appears like an extension (e.g., `auth.service.js`, `auth.api.js`).

## Package Name Convention

- Apps: `@ems/app-<name>`
- Domain Backend: `@ems/domain-backend-<name>`
- Domain Frontend: `@ems/domain-frontend-<name>`
- Domain Shared: `@ems/domain-shared-<name>`
- Packages: `@ems/<name>`
