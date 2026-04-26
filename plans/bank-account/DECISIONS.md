# Deviation Log — Bank Account

## Purpose

This document tracks all deviations from the approved implementation plan. Each deviation requires user approval before implementation.

## Deviation Log

| Date | Cycle | Original Plan | Problem Identified | Proposed Solution | Impact | Approval | Implemented |
|------|-------|---------------|-------------------|-------------------|--------|----------|-------------|

## Approved Deviations

| Date | Cycle | Original Plan | Problem Identified | Proposed Solution | Impact | Approval | Implemented |
|------|-------|---------------|-------------------|-------------------|--------|----------|-------------|
| 2026-04-26 | 2 | Create `account-list.dto.js` with custom paginated shape `{ items, pageSize, nextPageToken }` | A shared `pagination.dto.js` was already created ahead of schedule in `@ems/domain-shared-schema` with `createPageDtoSchema()` factory | Use `createPageDtoSchema(accountDtoSchema)` from the shared package instead. Response shape becomes `{ items, size, nextPageCursor }` (field names differ from spec but align with shared convention). | Low — reduces duplication and aligns with shared patterns | Approved | Done |
| 2026-04-26 | 2 | No `account-list-input.dto.js` planned | Shared `pagination.dto.js` provides `pageInputDtoSchema` for paginated list requests | Add step to create `account-list-input.dto.js` leveraging `pageInputDtoSchema` from shared package | Low — new step that adds needed input validation | Approved | Done |
| 2026-04-26 | 3 | Repository input types would be defined during implementation | `AccountListInput`, `AccountListFilterInput`, `PaginationCursor` already defined in `prisma/src/alias.ts` | Reference existing Prisma alias types in repository implementation | Low — types already available, no extra work needed | Approved | Pending |

## Rejected Deviations

*No rejected deviations yet.*
