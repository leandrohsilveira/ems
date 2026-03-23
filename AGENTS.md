# Development Agent Guidelines

## Before Starting Any Task

1. **Read `README.md`** for project overview and links to relevant documentation

2. **Read `STACK.md`** when you need context on the tech stack:
   - Focus on the relevant section based on your task:
     - **Backend work** → Read the Backend section
     - **Frontend work** → Read the Frontend section
     - **Authentication work** → Read the Authentication section
     - **General/architecture** → Read Paradigms and Development sections

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

## After Modifying Files

- **Always run lint** on JavaScript files
- **Always run tests** when modifying implementation files
- **Update documentation** if implementation changes behavior, APIs, or adds new features
