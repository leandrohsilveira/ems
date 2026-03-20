# Expense Management System

Track, categorize, and understand your finances in one web app.

A monorepo containing everything needed to run the application (except external dependencies like Svelte).

## Tech Stack

- **Language:** JavaScript with JSDoc (no TypeScript in implementation, types only)
- **Runtime:** Node.js
- **Package Manager:** npm workspaces
- **Approach:** Spec Driven Development (SDD) with Test Driven Development (TDD)

## Project Structure

```
ems/
├── apps/                     # Frontend and backend applications
│   └── <app_name>/           # Apps that start a server or process
├── packages/                 # Agnostic packages (shared utils, DB, UI components)
├── domain/                   # Domain business logic
│   ├── backend/
│   └── frontend/
├── types/                    # TypeScript type definitions
│   ├── backend/
│   ├── frontend/
│   └── shared/
└── PRODUCT.md                # Product specification
```

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev          # Start development server
npm run test         # Run tests
npm run lint         # Lint code
```

### Build

```bash
npm run build        # Build for production
```

See [PRODUCT.md](./PRODUCT.md) for full product specification.

## License

MIT
