# Login Page Design — EMS Minimal

Status: implemented

Context

- Minimal EMS login page centered on an 800x600 canvas.
- Elements (top-to-bottom): circular logo badge, EMS main title, Username field, Password field, Remember Me checkbox, Sign In button.
- Styling via Tailwind CSS with a configured theme.
- Localization/i18n deferred to a future pass.
- No authentication flow or API integration in this design; this is UI-only.

Layout and composition

- Frame: canvas with bg-background; login card centered within.
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
  - Text: EMS
  - Typography: bold, 24px, centered
  - class: "text-2xl font-semibold text-foreground text-center"
- Form
  - class: "flex flex-col gap-4"
  - Username field
    - Label: "Username"
    - class: "flex flex-col gap-1"
    - Label: class: "text-sm font-medium text-foreground"
    - Input: class: "h-11 w-full rounded-full bg-accent border border-input px-6 placeholder:text-muted-foreground"
  - Password field
    - Same structure as Username
    - Label: "Password"
  - Remember Me
    - class: "flex items-center gap-2"
    - Checkbox: class: "h-4 w-4 rounded border border-input bg-background"
    - Label: class: "text-sm text-foreground"
  - Sign In button
    - class: "w-full h-12 rounded-full bg-primary text-primary-foreground text-sm font-medium"

Spacing system

- Card padding: 40px all sides (p-10)
- Gap between header (logo + title) and form: 16px (gap-4)
- Gap between form fields: 16px (gap-4, consistent throughout form)

Accessibility

- Visible labels for all form fields
- aria-invalid and aria-describedby for errors (future implementation)
- Focus rings for interactive elements (future implementation)

Responsiveness

- Desktop: centered card with width 420px
- Mobile: card width ~90% of viewport; readable typography (future implementation)

Assets

- Logo: pill-shaped badge with EMS initials (placeholder)
- Replace with a real logo asset later if available

Validation details (Username and Password)

- Username: required (non-empty)
- Password: required (non-empty)
- Validation trigger: on submit only
- Inline error messages appear beneath the respective field when empty on submit
- Accessibility: aria-invalid on inputs; aria-describedby references error text

Localization

- Deferred to a future pass. No i18n strings externalization in this implementation.

Tailwind theme tokens used

- Colors: primary, primary-foreground, background, foreground, accent, input, muted-foreground, card, card-foreground
- Spacing: gap-4 (16px)
- Sizing: h-12 (48px), w-12 (48px), h-11 (44px), h-4 (16px), w-4 (16px)
- Border radius: rounded-full (pill), rounded-xl (16px)

Implementation notes

- The login.pen file uses flexbox layout throughout for consistent spacing
- The Header section contains logo and title, centered within the card
- All form fields use consistent gap-4 (16px)
- Input fields and Sign In button use rounded-full (pill-shaped)
- Checkbox uses rounded (subtle radius) to distinguish from inputs while remaining checkbox-like
