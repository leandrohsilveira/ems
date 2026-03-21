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

## After Modifying Files

- **Always run lint** on JavaScript files
- **Always run tests** when modifying implementation files
