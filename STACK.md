# Project tech stack

**Paradigms**:

- Prefer functional programming.
- Use dependency inversion when possible.
- Monorepo with npm workspaces.

**Runtime**:

- Node.js (latest LTS).

**Frontend**:

- Svelte for components, latest stable version, compatible with SvelteKit latest stable version.
- SvelteKit for the application, latest stable version.
- Tailwind for styling. Use tailwind-merge to help compose UI.

**Backend**:

- Fastify for exposing APIs. JSON format as default response.
- Prisma ORM for database management, with H2 as development database.
- pino for logging (built into Fastify).

**Authentication**:

- JWT (jsonwebtoken) for token generation and validation.
- bcrypt for password hashing.
- In-memory token storage (Redis for production).

**Development**:

- JavaScript with JSDoc type annotations.
- TypeScript for type checking only.
- Feature specs in `specs/` directory before implementation.
- Development agents with skills for consistent workflows.

**Project Structure**:

```
apps/          # Applications (servers, processes)
packages/     # Shared packages
domain/        # Domain logic (backend, frontend)
specs/         # Feature specifications
.agents/       # Development agent skills
```
