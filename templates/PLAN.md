# [Feature Name] Implementation Plan

## Overview

[Brief description of the feature and its purpose]

## Prerequisites

- [ ] Read and understand feature specification at `specs/<feature-slug>/spec.md`
- [ ] Review existing architecture and dependencies
- [ ] Understand design requirements (if applicable)

## Cycles

### Cycle 1: [Core Functionality / Innermost Layer]

**Objective:** [What this cycle accomplishes]

**Steps:**

- [ ] Step 1: [Specific action, e.g., "Create database migration for users table"]
- [ ] Step 2: [Specific action, e.g., "Implement User entity with Prisma schema"]
- [ ] Step 3: [Specific action, e.g., "Write unit tests for User entity"]

**Dependencies:** None (innermost layer)

**Quality Gates:**

- [ ] Lint passes
- [ ] Tests pass (100% coverage for new code)
- [ ] Type checking passes

### Cycle 2: [Service Layer / Business Logic]

**Objective:** [What this cycle accomplishes]

**Steps:**

- [ ] Step 1: [Specific action]
- [ ] Step 2: [Specific action]
- [ ] Step 3: [Specific action]

**Dependencies:** Cycle 1

**Quality Gates:**

- [ ] Lint passes
- [ ] Tests pass
- [ ] Type checking passes

### Cycle 3: [API Layer / Controllers]

**Objective:** [What this cycle accomplishes]

**Steps:**

- [ ] Step 1: [Specific action]
- [ ] Step 2: [Specific action]
- [ ] Step 3: [Specific action]

**Dependencies:** Cycle 2

**Quality Gates:**

- [ ] Lint passes
- [ ] Tests pass
- [ ] Type checking passes

### Cycle 4: [UI Layer / Frontend Components]

**Objective:** [What this cycle accomplishes]

**Steps:**

- [ ] Step 1: Review design specifications
- [ ] Step 2: Create component with TDD
- [ ] Step 3: Implement Storybook stories
- [ ] Step 4: Integrate with backend API

**Dependencies:** Cycle 3

**Quality Gates:**

- [ ] Lint passes
- [ ] Tests pass
- [ ] Type checking passes
- [ ] Storybook stories work correctly
- [ ] Design matches specifications

## Dependencies Graph

```
Cycle 1 (Database) → Cycle 2 (Service) → Cycle 3 (API) → Cycle 4 (UI)
```

## Testing Strategy

- **Unit Tests:** Vitest with `vi.fn()`, `vi.mock()`, `vi.spyOn()`
- **Integration Tests:** API endpoints and service interactions
- **Component Tests:** Svelte component behavior and interactions
- **Coverage Goal:** 100% for new code, maintain existing coverage

## Design Compliance (Frontend Only)

- [ ] Follow design tokens from `design-system.pen`
- [ ] Use Tailwind CSS with project theme
- [ ] Implement responsive design as specified
- [ ] Verify against design screenshots

## Risk Assessment

- **Technical Risks:** [List potential technical challenges]
- **Mitigation Strategies:** [How to address each risk]
- **Fallback Options:** [Alternative approaches if primary fails]

## Success Criteria

- [ ] All user stories from spec are implemented
- [ ] All tests pass with required coverage
- [ ] Code follows project conventions and architecture
- [ ] Documentation is updated where needed
- [ ] Performance meets requirements
