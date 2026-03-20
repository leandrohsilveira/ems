---
name: Feature Spec Writer
description: Creates detailed feature specifications for software projects. Use this skill when asked to write a feature spec, create a feature specification, draft a spec, or document a new feature.
triggers:
  - "create a feature spec"
  - "write a feature spec"
  - "feature specification"
  - "document a feature"
  - "draft a spec"
  - "write spec"
---

# Feature Spec Writing

Create feature specifications by understanding the project context and detailed requirements.

## Usage

```
/feature-spec <feature-name>
```

## Workflow

1. Read `PRODUCT.md` and `README.md` from the project root to understand project context, domain, and existing features
2. Ask the user for a detailed description of the feature to spec
3. Generate a feature slug from the feature name (kebab-case, e.g., "Invoice Management" → `invoice-management`)
4. Create the specification file at `specs/<feature-slug>/spec.md`
5. Review the spec with the user and iterate if needed

## Output Format

The spec.md file should follow this structure:

```markdown
# <Feature Name>

## Summary
Brief description of the feature (2-3 sentences).

## Problem Statement
Why is this feature needed? What user pain point does it address?

## User Stories
- **As a** [user type], **I want to** [action], **so that** [benefit]
- ...

## Requirements

### Functional Requirements
1. [Requirement]
2. [Requirement]

### Non-Functional Requirements
- Performance: [if applicable]
- Security: [if applicable]
- Accessibility: [if applicable]

## Design

### Data Model
```
[Entity relationship or data structure description]
```

### User Interface
[Key UI elements and interactions]

### API Endpoints (if applicable)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/... | ... |

## Technical Approach
Description of the technical implementation approach.

## Dependencies
- External services or libraries required
- Internal modules this feature depends on

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| ... | ... |

## Acceptance Criteria
- [ ] [Criterion]
- [ ] [Criterion]

## Out of Scope
- [Item]
```

## Tips

- Always ground the feature in the project context from PRODUCT.md
- Ensure user stories are user-centric and describe the value
- Be specific about acceptance criteria (they should be testable)
- Flag any ambiguous requirements for clarification
