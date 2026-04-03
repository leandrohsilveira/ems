# Sign Up Page Design — EMS Minimal

Status: pending implementation

## Context

- Minimal EMS sign-up page centered on a 1204x1007 canvas.
- Elements (top-to-bottom): circular logo badge, "Create Account" title, form fields (username, email, first name, last name, password, confirm password), Sign Up button, login link.
- Styling via Tailwind CSS with a configured theme.
- Localization/i18n deferred to a future pass.
- No authentication flow or API integration in this design; this is UI-only.

## Layout and composition

- Frame: canvas with bg-background; sign-up card centered within.
- Card/container
  - class: "w-[420px] bg-card rounded-xl shadow-md p-10 flex flex-col gap-4"
  - Visuals: bg-white with rounded-xl and shadow-md
  - Layout: flexbox vertical with 16px gap between elements
- Header section
  - Container for logo and title
  - class: "flex flex-col items-center gap-4"
- Logo area
  - Circular badge (pill-shaped) at the top of the card
  - Size: 48x48
  - class: "h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold"
  - Content: EMS initials centered
- Title
  - Text: "Create Account"
  - Typography: bold, 24px, centered
  - class: "text-2xl font-semibold text-foreground text-center"
- Form
  - class: "flex flex-col gap-4"
  - Username field
    - Label: "Username"
    - class: "flex flex-col gap-1"
    - Label: class: "text-sm font-medium text-foreground"
    - Input: class: "h-11 w-full rounded-full bg-accent border border-input px-6 placeholder:text-muted-foreground"
  - Email field
    - Same structure as Username
    - Label: "Email"
  - First Name field (optional)
    - Label: "First Name (Optional)"
    - Same input styling as Username
  - Last Name field (optional)
    - Label: "Last Name (Optional)"
    - Same input styling as Username
  - Password field
    - Label: "Password"
    - Same input styling as Username
  - Confirm Password field
    - Label: "Confirm Password"
    - Same input styling as Username
  - Sign Up button
    - class: "w-full h-12 rounded-full bg-primary text-primary-foreground text-sm font-medium"
- Login link section
  - class: "flex items-center justify-center gap-1"
  - Text: "Already have an account?"
  - Link: "Sign In"
  - class: "text-sm text-muted-foreground" for text
  - class: "text-sm font-medium text-primary" for link

## Spacing system

- Card padding: 40px all sides (p-10)
- Gap between header (logo + title) and form: 16px (gap-4)
- Gap between form fields: 16px (gap-4, consistent throughout form)
- Gap between button and login link: 16px (gap-4)

## Accessibility

- Visible labels for all form fields
- aria-invalid and aria-describedby for errors (future implementation)
- Focus rings for interactive elements (future implementation)
- Clear visual hierarchy with proper heading structure
- Sufficient color contrast for all text elements

## Responsiveness

- Desktop: centered card with width 420px
- Mobile: card width ~90% of viewport; readable typography (future implementation)
- Form fields stack vertically on smaller screens

## Assets

- Logo: pill-shaped badge with EMS initials (placeholder)
- Replace with a real logo asset later if available

## Validation details

- Username: required, 3-30 characters, alphanumeric with underscores/dashes
- Email: required, valid email format, 255 character max
- First Name: optional, 100 character max
- Last Name: optional, 100 character max
- Password: required, 8-128 characters with strength requirements
- Confirm Password: required, must match password field
- Validation trigger: real-time validation for all fields
- Password strength indicator: shows requirements (future implementation)
- Inline error messages appear beneath the respective field when validation fails
- Accessibility: aria-invalid on inputs; aria-describedby references error text

## Localization

- Deferred to a future pass. No i18n strings externalization in this implementation.

## Tailwind theme tokens used

- Colors: primary (#3b82f6), primary-foreground (#ffffff), background (#ffffff), foreground (#1a1a1a), accent (#f5f5f5), input (#d4d4d4), muted-foreground (#737373), card (#ffffff), card-foreground (#1a1a1a), border (#e5e5e5)
- Spacing: gap-4 (16px)
- Sizing: h-12 (48px), w-12 (48px), h-11 (44px)
- Border radius: rounded-full (pill), rounded-xl (16px)

## Implementation notes

- The design.pen file uses flexbox layout throughout for consistent spacing
- The Header section contains logo and title, centered within the card
- All form fields use consistent gap-4 (16px)
- Input fields and Sign Up button use rounded-full (pill-shaped)
- Optional fields are clearly marked with "(Optional)" in the label
- Login link provides clear navigation to existing users
- Form follows the same visual pattern as the login page for consistency

## Design system alignment

- Uses the same logo badge component as login page
- Follows the same card styling (rounded-xl, shadow-md, padding)
- Maintains consistent input styling (rounded-full, bg-accent, border-input)
- Button styling matches primary action pattern
- Typography uses Inter font family with consistent sizing
- Color palette follows the defined design tokens

## Future enhancements

- Password strength indicator with visual feedback
- Email verification flow
- Social login options (OAuth/SSO)
- Multi-step sign-up for additional user information
- Success page design after sign-up completion
- Mobile-optimized responsive breakpoints
- Dark mode support
- Accessibility improvements (focus states, screen reader announcements)
