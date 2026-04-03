# User Sign-up Feature Specification

## Summary

A self-service user registration feature that allows new users to create accounts in the Expense Management System. The feature includes a sign-up form with validation, success page, and integration with the existing authentication API.

## Problem Statement

New users need a way to create accounts to access the Expense Management System's financial tracking capabilities. Without self-service sign-up, user onboarding requires manual intervention, slowing adoption and increasing administrative overhead.

## User Stories

- **As a** new user, **I want to** create an account with my credentials and basic information, **so that** I can access the Expense Management System
- **As a** user, **I want to** see clear validation errors when my input is invalid, **so that** I can correct mistakes quickly
- **As a** user, **I want to** have my password securely stored, **so that** my account remains protected
- **As a** user, **I want to** be redirected to a success page after successful sign-up, **so that** I know my account was created
- **As a** user, **I want to** easily navigate to the login page if I already have an account, **so that** I can sign in instead

## Requirements

### Functional Requirements

1. **Sign-up Form**
   - Form fields: username, email, password, confirm password, first name (optional), last name (optional)
   - Real-time validation for all fields
   - Password strength indicator
   - Confirm password matching validation
   - Submit button with loading state

2. **Validation Rules**
   - Username: 3-30 characters, alphanumeric with underscores/dashes
   - Email: Valid email format, 255 character max
   - Password: 8-128 characters, with strength requirements
   - First/Last name: Optional, 100 character max each
   - Confirm password: Must match password field

3. **API Integration**
   - Call `/auth/signup` endpoint with validated data
   - Handle success responses (201 Created)
   - Handle error responses (400 Validation, 409 Conflict, 500 Server Error)

4. **User Experience**
   - Show loading state during submission
   - Display field-specific validation errors
   - Redirect to success page on successful sign-up
   - Provide link to login page

### Non-Functional Requirements

- **Security**: Passwords hashed server-side, HTTPS required, no sensitive data in logs
- **Accessibility**: WCAG 2.1 AA compliant, keyboard navigation, screen reader support
- **Performance**: Form submission < 2 seconds, validation feedback < 200ms
- **Responsive Design**: Mobile-friendly layout (320px+ viewports)

## Design

### Data Model

Uses existing `User` Prisma model:

```prisma
model User {
  id        String   @id @default(cuid())
  firstName String?
  lastName  String?
  email     String   @unique
  username  String   @unique
  password  String
  role      Role     @default(USER)
}
```

### User Interface

Based on `specs/user-signup/design.pen`:

**Layout & Structure**

- Centered card (420px width) with shadow and border
- Logo badge with "EMS" text
- "Create Account" title
- Form fields with labels and rounded inputs
- Blue primary button for submission
- "Already have an account? Sign In" link

**Design Tokens (from .pen variables)**

- Primary color: `#3b82f6` (blue)
- Background: `#ffffff` (white)
- Foreground text: `#1a1a1a` (near-black)
- Muted text: `#737373` (gray)
- Input background: `#f5f5f5` (light gray)
- Border color: `#e5e5e5` (light gray)
- Card shadow: `#0000000a` (transparent black)

**Spacing & Dimensions**

- Card padding: 40px
- Field gap: 16px
- Input height: 44px
- Input padding: 18px horizontal, 24px vertical
- Input corner radius: 9999px (fully rounded)
- Button height: 48px
- Button corner radius: 9999px

**Typography**

- Font family: Inter
- Title: 24px, weight 600, line height 1.5556
- Labels: 14px, weight 500, line height 1.4286
- Input text: 14px, weight normal, line height 1.4286
- Button text: 14px, weight 500, line height 1.5556
- Link text: 14px, weight 500, line height 1.4286

### API Endpoints

| Method | Endpoint       | Description             | Request Body       |
| ------ | -------------- | ----------------------- | ------------------ |
| POST   | `/auth/signup` | Create new user account | `SignUpRequestDTO` |

**Request Schema (`SignUpRequestDTO`)**:

```typescript
{
  username: string; // 3-30 chars
  email: string; // email format, 255 max
  password: string; // 8-128 chars
  firstName: string | null; // optional, 100 max
  lastName: string | null; // optional, 100 max
}
```

**Response Schema (201 Created)**:

```typescript
{
  userId: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string; // "USER"
}
```

**Error Responses**:

- 400: Validation errors (field-specific messages)
- 409: User with username/email already exists
- 500: Server error

## Technical Approach

### Frontend Architecture

- **Location**: `domain/frontend/auth/signup/` for reusable components
- **Page**: `apps/web/src/routes/signup/+page.svelte`
- **BFF Pattern**: Server action in `+page.server.js` calls API Gateway
- **UI Components**: Use existing `@ems/ui` components (Input, Button, Paper)
- **Validation**: Client-side validation with Zod schemas
- **State Management**: Svelte 5 runes (`$state`, `$derived`)
- **Styling**: Tailwind CSS with design token variables

### Backend-for-Frontend (BFF) Flow

1. User submits form → SvelteKit form action
2. BFF validates data, calls `http://localhost:3000/auth/signup`
3. On success: Redirect to `/signup/success` page
4. On error: Return field-specific errors to form

### Success Page

- Separate route `/signup/success` (to be designed)
- Confirmation message with next steps
- Link to login page
- Optionally display created username/email

## Dependencies

- **Internal**: `@ems/ui` components (Input, Button, Paper)
- **Internal**: `@ems/types-shared-auth` for type definitions
- **Internal**: Existing `/auth/signup` API endpoint
- **External**: None beyond project stack

## Risks & Mitigations

| Risk                       | Mitigation                                                  |
| -------------------------- | ----------------------------------------------------------- |
| Duplicate user submissions | Disable submit button during submission, optimistic locking |
| Network failures           | Retry logic with exponential backoff, clear error messages  |
| Password security          | Frontend validation + server-side bcrypt hashing            |
| UI inconsistency           | Use design tokens from .pen file, follow existing patterns  |

## Acceptance Criteria

- [ ] User can access sign-up page at `/signup`
- [ ] Form displays all required fields with proper labels
- [ ] Real-time validation provides immediate feedback
- [ ] Password strength indicator shows requirements
- [ ] Confirm password validation ensures match
- [ ] Form submission shows loading state
- [ ] Successful sign-up redirects to success page
- [ ] Success page displays confirmation message and login link
- [ ] Duplicate username/email shows specific error message
- [ ] Validation errors display field-specific messages
- [ ] All form fields are accessible via keyboard
- [ ] Page is responsive (mobile 320px+ to desktop 1200px+)
- [ ] Design matches .pen file specifications (colors, spacing, typography)
- [ ] BFF correctly forwards API errors to frontend
- [ ] HTTP-only cookies are not set on sign-up (only on login)

## Out of Scope

- Email verification system
- Password reset functionality
- Social login (OAuth/SSO)
- Multi-factor authentication
- Administrative user management
- Success page design (separate specification needed)
