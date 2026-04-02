# AI-Assisted Workflow

## Overview

The AI-assisted workflow follows a structured micro-cycle approach: plan → implement → review. This ensures systematic, high-quality implementation with proper documentation and user oversight.

## Workflow Application Rules

### Mandatory Workflow (No Asking Required)

- **Feature implementations** matching specifications in the `specs/` folder
- **New components** (UI components, API endpoints, database entities)
- **Architectural changes** affecting system boundaries or multiple layers

### Optional Workflow (Ask User)

- **Fixes** impacting 1-3 files (including associated tests and stories)
- **Refactors** with limited scope
- **Configuration updates** with cross-service dependencies

### Workflow Exemptions

- **Single file changes** (any type, including associated test file)
- **Documentation-only updates** without code changes
- **Simple typo/formatting corrections**

### File Counting Examples

- Component + test + story = **3 files** → Ask about workflow
- Service + test = **2 files** → Ask about workflow
- Single file (any type) = **1 file** → Direct implementation
- 4+ files = **Complex** → Recommend workflow

## Workflow Phases

### Phase 1: Plan/Architect Mode

1. **Master Plan Creation**: Create detailed implementation plan with micro-cycles
2. **User Approval**: Present plan for user review and approval
3. **Plan Storage**: Save to `plans/<feature-slug>/PLAN.md`

### Phase 2: Build/Editor Mode

1. **Cycle Execution**: Implement each micro-cycle sequentially
2. **Step Validation**: After each step, ask user if implementation is satisfactory
3. **Deviation Management**: If deviation from plan is needed, seek approval and document in `DECISIONS.md` when approved
4. **Quality Gates**: Run lint, tests, and type checks after each cycle

### Phase 3: Review Mode

1. **Code Review**: Perform GitHub PR-style review focusing on architecture and conventions
2. **Suggestions**: Provide file:line references with code snippets for suggested changes
3. **User Decisions**: User selects which suggestions to apply
4. **Final Implementation**: Apply approved changes

## Micro-Cycle Structure

Each cycle follows this pattern:

1. **Plan**: Detailed steps for the cycle
2. **Implement**: Execute steps with TDD where applicable
3. **Review**: Code review and user feedback
4. **Update**: Mark cycle as complete in PLAN.md

## Deviation Management

### When Deviation is Needed

Any implementation different from the approved plan requires:

2. **Approval**: Seek user approval before implementing
1. **Documentation**: Record in `plans/<feature-slug>/DECISIONS.md` when approved
1. **Update**: Immediately update PLAN.md if deviation is approved

### Deviation Criteria

- API signature changes
- Different algorithm/implementation approach
- Additional or different dependencies
- Scope changes (features added/removed)
- Performance optimizations requiring redesign

## Quality Assurance

### Mandatory Checks

- **Lint**: All JavaScript/TypeScript files must pass linting
- **Tests**: All tests must pass (TDD is default approach)
- **Type Checking**: TypeScript compilation must succeed
- **Documentation**: Update relevant documentation for API/behavior changes

### Verification Process

1. Run checks after each cycle
2. Fix any issues before proceeding
3. User approval for any required changes to tests or architecture

## Plan Documentation

### PLAN.md Structure

Located at `plans/<feature-slug>/PLAN.md`:

- Feature overview and objectives
- Ordered cycles with dependencies
- Detailed steps for each cycle
- Checkboxes for tracking completion
- Quality gate requirements

See [PLAN.md template](./templates/PLAN.md).

### DECISIONS.md Structure

Located at `plans/<feature-slug>/DECISIONS.md`:

- Deviation log with timestamps
- Original plan vs proposed change
- User approval status
- Implementation notes

See [DECISIONS.md template](./templates/DECISIONS.md).

## Execution Flow

```
User Request → Agent Analysis → Decision → Execution
    ↓
Analysis:
    ├─ Feature spec exists? → Auto workflow
    ├─ Fix impacting 1-3 files? → Ask about workflow
    ├─ Fix impacting 4+ files? → Recommend workflow
    └─ Single file? → Direct implementation
        ↓
If workflow:
    Create PLAN.md + DECISIONS.md
    Get user approval
    Execute cycles
    If deviation → Document + Ask approval → Update plan immediately
```

## Best Practices

1. **Start with innermost layers** (least dependencies)
2. **Follow TDD** for all implementation where applicable
3. **Keep cycles small** and focused
4. **Document decisions** for future reference
5. **Maintain consistency** with existing code patterns
6. **Verify against design** for frontend components
