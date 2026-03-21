# Development Agent Guidelines

## Before Starting Any Task

1. **Read `README.md`** first to understand:
   - Workspace structure (apps/, packages/, domain/, types/)
   - Conventions (kebab-case filenames, package naming rules)
   - Development commands (dev, test, lint, build)

2. **Read `STACK.md`** when you need context on the tech stack:
   - Focus on the relevant section based on your task:
     - **Backend work** → Read the Backend section
     - **Frontend work** → Read the Frontend section
     - **Authentication work** → Read the Authentication section
     - **General/architecture** → Read Paradigms and Development sections

## Before Implementation
- Create tests using Test Driven Development (TDD) approach.
- Run tests to confirm it fails.
- Proceed with the implementation to make the tests pass.
- Look for refactoring opportunities and refactor.
- Check tests again.

## Feature Implementation

When implementing a new feature, check the `specs` folder for a feature specification:

- Look for `specs/<feature-name-slug>/spec.md`
- Follow the specification for feature requirements and behavior
- If no spec exists, use the `feature-spec` skill to create one before implementation

## After Modifying Files

- **Always run lint** on TypeScript or JavaScript files
- **Always run tests** when modifying JavaScript files (implementation)
