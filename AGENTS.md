# Development Agent Guidelines

## Before Starting Any Task

1. **Read `README.md`** for project overview and links to relevant documentation

2. **Read `STACK.md`** when you need context on the tech stack:
   - Focus on the relevant section based on your task:
     - **Backend work** → Read the Backend section
     - **Frontend work** → Read the Frontend section
     - **Authentication work** → Read the Authentication section
     - **General/architecture** → Read Paradigms and Development sections

3. **Read `ARCHITECTURE.md`** to understand the project structure and architectural principles:
   - Applications (API Gateway, Web)
   - Domain packages organization
   - Types packages
   - Clean Architecture principles (vertical/horizontal boundaries, dependency rule)

## Before Implementation

1. **Read `CONVENTIONS.md`** for code style and naming conventions
2. **Understand existing code** relevant to your task
3. **Write tests first** (TDD is the default approach):
   - Use Vitest for unit tests
   - Use `vi.fn()`, `vi.mock()`, `vi.spyOn()` for mocking
   - Skip tests only when explicitly told TDD isn't required
4. **Implement** the feature or fix
5. **Refactor** for clarity and maintainability
6. **Verify** by running the full test suite

## Feature Implementation

When implementing a new feature, check the `specs` folder for a feature specification:

- Look for `specs/<feature-name-slug>/spec.md`
- Follow the specification for feature requirements and behavior
- If no spec exists, use the `feature-spec` skill to create one before implementation

### Frontend Implementation with Pencil MCP

When implementing frontend features, use Pencil MCP to access design files:

1. **Open the design system file** (design-system.md on workspace root) using `pencil_open_document`
2. **Open the design file** using `pencil_open_document`:
   - Design canvas: `specs/<feature-name>/design.pen`
   - Design specs: `specs/<feature-name-slug>/design.md`

3. **Access design details**:
   - Use `pencil_batch_get` to read component structures
   - Use `pencil_get_screenshot` to preview UI elements
   - Use `pencil_snapshot_layout` to understand spacing and alignment

4. **Load Svelte skills** when implementing Svelte components:
   - Use `skill` tool to load `svelte-code-writer` skill
   - Use `skill` tool to load `svelte-core-bestpractices` skill

5. **Implement using Tailwind CSS**:
   - Use the theme tokens defined in the design (e.g., `bg-primary`, `text-foreground`)
   - Follow the class patterns from design.md (e.g., `rounded-full`, `gap-4`)
   - The project uses a configured Tailwind theme - do not use arbitrary values

6. **Verify implementation** against design:
   - Export design screenshots for comparison
   - Check spacing, colors, and typography match the design tokens

### Design System Component Creation

Design system components live in `packages/ui/src/lib/components/` and must follow TDD.

**1. Create component folder and files:**

```
packages/ui/src/lib/components/<component-name>/
├── <component-name>.svelte
└── index.js
```

**2. Write tests first** (TDD approach):

- Create test file alongside component: `<component-name>.test.ts`
- Use Vitest with `vi.fn()`, `vi.mock()`, `vi.spyOn()` for mocking
- Test component behavior, props, and interactions

**3. Implement the component**:

- Use `pencil_open_document` to open `design-system.pen` for design tokens and patterns
- Use `skill` tool to load `svelte-code-writer` skill for Svelte 5 patterns
- Use `skill` tool to load `svelte-core-bestpractices` skill for best practices
- **Tailwind CSS is mandatory** for styling
- Follow existing patterns:
  - Use `$props()` rune for props
  - Use `cn()` utility from `../../utils` for class merging
  - Add JSDoc type hints for props
- Keep component focused and reusable

**4. Create Storybook story**:

- Use the `storybook-story-creator` skill to create stories
- Create `*.stories.svelte` file in the component folder (same folder as component)
- Document all component states and variants

**5. Export from barrel file** (`index.js`):

```js
export { default } from "./<component-name>.svelte";
```

## Workflow Enforcement

**Read `WORKFLOW.md` file** to have a better understanding of the workflow implementation.

### Decision Protocol

Before implementing any task, agents MUST follow this decision protocol:

1. **Check for Feature Specification**:
   - Look for matching spec in `specs/` folder (by name pattern and content)
   - If feature spec exists → **Apply workflow automatically** (no asking)

2. **Assess File Impact for Fixes**:
   - Count affected files (including tests and stories)
   - 1-3 files → **Ask user about workflow**
   - 4+ files → **Recommend workflow**
   - Single file → **Direct implementation**

3. **Present Workflow Option** (when applicable):

   ```
   I'll help you with [task description]. This affects [X] files.

   **AI-Assisted Workflow Option:**
   - Creates detailed implementation plan with micro-cycles
   - Follows TDD approach where applicable
   - Includes code review phase
   - Ensures quality gates (lint, test, check)

   Would you like to use the structured AI-assisted workflow for this task?

   [✅ Yes, use structured workflow]
   [❌ No, proceed with direct implementation]
   ```

### Workflow Execution

When workflow is applied:

1. **Create Plan Directory**:
   - `mkdir -p plans/<feature-slug>/`
   - Create `PLAN.md` using template
   - Create `DECISIONS.md` for deviation tracking

2. **Plan Approval**:
   - Present plan to user for review
   - Get explicit approval before implementation
   - Enter Build/Editor mode only after approval

3. **Cycle Implementation**:
   - Execute cycles in dependency order (inner layers first)
   - Follow TDD: write tests → implement → refactor
   - After each step, ask user if implementation is satisfactory

4. **Deviation Management**:
   - If deviation from plan is needed:
     - Document in `DECISIONS.md` with original plan, problem, and solution
     - Ask user for approval
     - If approved → update `PLAN.md` immediately
     - If rejected → seek alternative solution

5. **Quality Gates**:
   - Run lint, tests, and type checks after each cycle
   - Fix any issues before proceeding
   - User approval for test/architecture changes

6. **Code Review**:
   - Perform GitHub PR-style review
   - Provide suggestions with file:line references and code snippets
   - User selects which suggestions to apply
   - Apply approved changes

### File Counting Rules

**Count as separate files:**

- Implementation file (`.svelte`, `.ts`, `.js`)
- Test file (`.test.ts`, `.spec.ts`)
- Story file (`.stories.svelte`)
- Configuration file affecting implementation

**Examples:**

- `Button.svelte` + `Button.test.ts` + `Button.stories.svelte` = **3 files**
- `auth.service.ts` + `auth.service.test.ts` = **2 files**
- Single file (any type) = **1 file**

### Integration with Existing Guidelines

- **Before Starting Any Task**: Include workflow decision check
- **Feature Implementation**: Reference workflow for features with specs
- **Design System Components**: Always use workflow for new components
- **After Modifying Files**: Include plan updates for deviations

## After Modifying Files

- **Always run lint and check** scripts on JavaScript files
- **Always run tests** when modifying implementation files
- **Update documentation** if implementation changes behavior, APIs, or adds new features
