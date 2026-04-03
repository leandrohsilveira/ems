# Frontend User Signup Implementation Plan

## Feature Overview

Implement the frontend part of the user signup feature following the BFF (Backend-for-Frontend) pattern. The feature includes a signup form with validation, success page, and integration with the existing authentication API.

## Objectives

1. Create reusable signup form component in domain frontend package
2. Implement signup page at `/signup` with BFF server action
3. Create success page at `/signup/success`
4. Ensure design matches specification with existing Tailwind theme
5. Follow TDD approach with comprehensive testing

## Dependencies

- Existing `/auth/signup` API endpoint
- `@ems/ui` components (input, button, paper)
- `@ems/types-shared-auth` for type definitions
- Existing Tailwind theme configuration

## Cycles

### Cycle 1: Domain Frontend Package Structure

**Goal**: Set up `@ems/domain-frontend-auth` package with proper configuration

**Steps**:

1. Create directory structure: `domain/frontend/auth/`
2. Copy configuration files from `@ems/ui` template
3. Create `package.json` with correct dependencies and exports
4. Create entry point files (`index.js`)
5. Verify package builds correctly

**Quality Gates**:

- [x] Package builds without errors
- [x] Configuration files match UI package patterns
- [x] Exports follow `@ems/ui` pattern

**Dependencies**: None (innermost layer)

### Cycle 2: Signup Form Component Tests (TDD)

**Goal**: Write comprehensive tests for signup-form component with corrected architecture

**Steps**:

1. Create `signup-form.svelte.test.js` with test structure
2. Test component renders all form fields with correct props:
   - Accepts `form` prop with `errors` and `loading` properties
   - Accepts `enhance` prop (SvelteKit enhance function)
   - Accepts `action` prop (default: '/signup')
3. Test component applies `enhance` to form element
4. Test loading state management via `enhance` callback
5. Test error display from `form.errors` (field-specific) and `form.error` (general)
6. Test form attributes: `method="POST"`, `action` prop, input `name` attributes
7. Test accessibility: `aria-invalid`, `aria-describedby` for errors
8. Test design compliance: Tailwind classes (p-10, gap-4, h-11, h-12, rounded-full)

**Quality Gates**:

- [x] All tests fail initially (TDD)
- [x] Test structure follows UI package patterns
- [x] Tests mock `enhance` function (no SvelteKit dependency)
- [x] No API mocking in component tests (BFF responsibility)

**Note**: Tests were updated during Cycle 4 to match new component architecture (separate `errors` and `errorMessage` props instead of nested `form` prop).

**Dependencies**: Cycle 1 (package structure)

### Cycle 3: Signup domain server action

**Goal**: Create a server action function calling signup endpoint

**Steps**:

1. Create `src/lib/components/signup-form/server/signup.js` with `submitSignupAction(client, formData)` function
2. Implement type-safe request using `@ems/types-shared-auth`
3. Add error handling for 400, 409, 500 responses
4. Return structured error object for BFF
5. Write tests for API client

**Quality Gates**:

- [x] API client handles all error cases
- [x] Type safety with JSDoc annotations
- [x] Tests cover success and error scenarios

**Dependencies**: Cycle 1 (package structure)

### Cycle 4: Signup Form Component Implementation

**Goal**: Implement `signup-form.svelte` component with corrected architecture

**Steps**:

1. Update `signup-form.svelte` with Svelte 5 runes and new architecture
2. Implement component props: `errors`, `errorMessage`, `enhance`, `action` (default: '/signup'), `loginHref` (required)
3. Implement form fields: username, email, password, confirmPassword, firstName, lastName
4. Display errors from `errors` (field-specific) and `errorMessage` (general)
5. Apply `enhance` prop to form with internal loading state management
6. Import UI components: `import Input from '@ems/ui/components/input'`
7. Style with Tailwind classes matching design spacing
8. Ensure all tests pass

**Architecture Decisions**:

- Component accepts separate `errors` and `errorMessage` props (not nested in `form`)
- Component manages loading state internally via `enhance` callback
- `loginHref` is required prop for login link navigation
- Uses `FormEnhancerAction` type for `enhance` prop from `@ems/types-frontend-ui`
- Error type uses `Partial<Record<...>>` to allow missing error fields

**Quality Gates**:

- [x] All tests pass
- [x] Component follows kebab-case filename convention
- [x] No SvelteKit imports in component (`enhance` passed as prop)
- [x] Design spacing matches spec (gap-4, h-11, h-12, rounded-full)
- [x] Accessibility attributes for errors (aria-invalid, aria-describedby)
- [x] Uses existing UI components (Input, Button, Paper)
- [x] Follows login page patterns for `enhance` integration
- [x] JSDoc types correctly defined and exported with `@exports @typedef`

**Dependencies**: Cycle 2 (component tests - updated to match new architecture)

### Cycle 5: Web App Signup Page (BFF Layer)

**Goal**: Create signup page at `/signup`

**Steps**:

1. Create `apps/web/src/routes/signup/+page.svelte`
2. Import signup-form: `import SignupForm from '@ems/domain-frontend-auth/components/signup-form'`
3. Use layout pattern from login page
4. Add "Already have an account? Sign In" link using `resolve('/login')` from `$app/paths`
5. Create `+page.server.js` with form action that uses `submitSignupAction` from `@ems/domain-frontend-auth/server/actions/signup`
6. Implement BFF: create HTTP client with `createHttpClient(fetch, process.env)`, call domain action, handle responses
7. Ensure no HTTP-only cookies on signup
8. Create success page placeholder at `/signup/success/+page.svelte` for redirect target
9. Add dependencies: `@ems/domain-frontend-auth` and `@ems/domain-shared-api` to web app

**Implementation Details**:

- **Signup page**: Simple wrapper that passes `errors` and `errorMessage` props to signup-form component
- **Server actions**: Uses `createHttpClient` with SvelteKit's `fetch` and `process.env` (reads `API_URL` from `.env.local`)
- **No BFF validation**: Passes raw `FormData` to domain action, lets API handle validation
- **Success handling**: Redirects to `/signup/success` on success, returns errors on failure
- **URL resolution**: Uses `resolve()` from `$app/paths` for proper URL resolution in different contexts
- **No authentication**: No cookies set, no `load` function needed (public page)

**Quality Gates**:

- [x] Page loads without errors
- [x] Form submission works end-to-end
- [x] BFF pattern correctly implemented
- [x] Error propagation from API to form

**Dependencies**: Cycle 3 (submit domain server action), Cycle 4 (component)

### Cycle 6: Success Page Implementation

**Goal**: Create success page at `/signup/success`

**Steps**:

1. Create `apps/web/src/routes/signup/success/+page.svelte`
2. Add generic confirmation message (no name/email mentioned)
3. Include message: "Please check your email to click the verification link"
4. Add link to login page
5. Style with Tailwind classes

**Quality Gates**:

- [ ] Page loads after successful signup
- [ ] Message is user-friendly and appropriate
- [ ] Design consistency with rest of app

**Dependencies**: Cycle 5 (signup page)

### Cycle 7: Design Verification & Polish

**Goal**: Ensure design matches specification using existing Tailwind theme

**Steps**:

1. Verify spacing: card padding (p-10), field gap (gap-4), input height (h-11), button height (h-12)
2. Verify rounded inputs: `rounded-full`
3. Use existing theme colors (as-is, don't update)
4. Check responsive design (mobile 320px+ to desktop 1200px+)
5. Verify accessibility (keyboard navigation, screen reader support)

**Quality Gates**:

- [ ] Design matches spec spacing
- [ ] Existing theme colors used (not design spec colors)
- [ ] Responsive design works
- [ ] Accessibility requirements met

**Dependencies**: All previous cycles

### Cycle 8: Final Testing & Quality Assurance

**Goal**: Comprehensive testing and quality checks

**Steps**:

1. Run unit tests for domain package
2. Run integration tests for web app
3. Run linting on all files
4. Run type checking
5. Build verification for both packages
6. Fix any issues found

**Quality Gates**:

- [ ] All tests pass
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Build succeeds
- [ ] No HTTP-only cookies on signup

**Dependencies**: All previous cycles

## Implementation Notes

### File Naming Convention

- All filenames use **kebab-case**: `signup-form.svelte`, `signup.api.js`
- Function names use **camelCase**: `validateUsername()`, `validateEmail()`
- Variable names use **camelCase**: `formData`, `loadingState`

### Import Patterns

```javascript
// In domain package
import Input from "@ems/ui/components/input";

// In web app
import SignupForm from "@ems/domain-frontend-auth/components/signup-form";
```

### Validation Rules (User-Friendly Messages)

- Username: "Username must be 3-30 characters and can only contain letters, numbers, underscores, and dashes"
- Email: "Please enter a valid email address"
- Password: "Password must be 8-128 characters"
- Confirm password: "Passwords do not match"
- Name: "Name cannot exceed 100 characters"

### API Error Mapping

- 400 Validation: Map field errors to user-friendly messages
- 409 Conflict: "Username or email already exists"
- 500 Server Error: "Something went wrong. Please try again later"

## Progress Tracking

### Cycle 1: Domain Frontend Package Structure

- [x] Create directory structure
- [x] Copy configuration files
- [x] Create package.json
- [x] Create entry points
- [x] Verify build

### Cycle 2: Signup Form Component Tests (TDD)

- [x] Create test file
- [x] Test component props and rendering
- [x] Test error display
- [x] Test form attributes and accessibility

### Cycle 3: Signup domain server action

- [x] Create domain server action
- [x] Implement error handling
- [x] Write tests
- [x] Verify type safety

### Cycle 4: Signup Form Component Implementation

- [x] Update component with new props interface (errors, errorMessage, loginHref)
- [x] Implement form fields display (6 fields with proper attributes)
- [x] Implement error display from errors and errorMessage props
- [x] Implement enhance integration with internal loading state management
- [x] Style with Tailwind design compliance
- [x] Update tests to match new architecture
- [x] Fix test interactions for vitest-browser-svelte API
- [x] Verify accessibility attributes
- [x] Run and pass all tests

### Cycle 5: Web App Signup Page (BFF Layer)

- [x] Create page file
- [x] Import signup-form
- [x] Create server action
- [x] Implement BFF logic, use domain server action
- [x] Add login link

### Cycle 6: Success Page Implementation ✅ COMPLETED

- [x] Create success page component in `@ems/domain-frontend-auth`
- [x] Add confirmation message with email verification instruction
- [x] Add login link with `loginHref` prop
- [x] Style with Tailwind using success colors and bootstrap-icons

### Cycle 7: Design Verification & Polish

- [ ] Verify spacing
- [ ] Verify colors
- [ ] Check responsive design
- [ ] Verify accessibility

### Cycle 8: Final Testing & Quality Assurance

- [ ] Run unit tests
- [ ] Run integration tests
- [ ] Run linting
- [ ] Run type checking
- [ ] Build verification
