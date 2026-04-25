# Bank Account Design

Status: draft

## Screens

### 1. Accounts List — Desktop
**File:** `accounts-list-desktop.png`

Full-screen layout (1440x900) with sidebar navigation and main content area.

**Sidebar** (256px, wrapped in 8px margin):
- **Logo**: 32x32 pill badge (`$h:--primary` background) with "EMS" text + "EMS" brand text (18px)
- **Navigation**: Finance section with Dashboard, Accounts (active), Transactions, Categories, Reports
- **Footer**: User info (Joe Doe, joe@acmecorp.com)

**Main content** (`fill_container`, padding: 32px, gap: 24px):
- **Page header**: Title "Accounts" (28px, 600 weight) + Subtitle "Manage your bank accounts" (14px, muted) + "New Account" button (Button/Default, plus icon + text)
- **Card list**: Vertical stack with 12px gap

**Card rows** (Card component `h:ZqeIe`, rounded corners, shadow, `fill_container` width):
Header and Actions slots disabled. Content slot replaced with horizontal layout:

| Column | Width | Content |
|--------|-------|---------|
| Account name | `fill_container` | Name (16px, 500) + "Bank Account" label (13px, muted) |
| Balance | 160px | Amount (18px, 600, right-aligned) + "Balance" label (13px, muted, right-aligned) |
| Date | 120px | Date (14px, right-aligned) + "Created" label (13px, muted, right-aligned) |
| Actions | 88px | Icon Button/Default (edit, pencil) + Icon Button/Destructive (delete, trash) |

### 2. Accounts List — Mobile
**File:** `accounts-list-mobile.png`

Stacked layout (414x896), no sidebar.

**Top bar** (padding: [16, 20, 12, 20]):
- **Left**: Hamburger menu icon (Icon Button/Ghost, `menu` icon)
- **Center**: EMS logo (48px pill badge, `$h:--primary` background, "EMS" in white at 16px)
- **Right**: Spacer (36px, for balance)

**Title bar** (below top bar):
- **Left**: "Accounts" title (22px, 600 weight)
- **Right**: "+" icon button (Icon Button/Default)

**Card list** (padding: [16, 20], gap: 12px):

Each card is a plain frame (not Card component) with `$h:--card` fill, rounded corners, shadow, border, `padding: [14, 16]`, `gap: 10`:
- **Row 1**: Account name (16px, 500) + Icon Button/Default (pencil) + Icon Button/Destructive (trash), `space_between`
- **Row 2**: Balance (20px, 600) + Date (13px, muted), `space_between`

### 3. Create Account Modal
**File:** `create-account-modal.png`

Accounts List — Desktop as background with 40% opacity overlay (`#00000066`). Modal/Center (`h:HwiOa`) centered over the overlay.

**Structure:**
- **Header**: "Create Account" title (20px, 500) + "Add a new bank account to your ledger" subtitle (14px, muted)
- **Content**: Vertical form (gap: 16px, padding: 40px)
  - **Account Name** input (Input Group/Default, label "Account Name", placeholder "e.g. Nubank Checking")
  - **Initial Balance** input (Input Group/Default, label "Initial Balance", placeholder "0,00")
- **Actions**: 
  - "Create Account" button (Large/Default, primary, no icon, `fill_container`)
  - "Cancel" button (Large/Secondary, no icon, `fill_container`)
- Content slot height: `fit_content` (not clipped)

### 4. Edit Account Modal
**File:** `edit-account-modal.png`

Copy of Create Account Modal with edit-context text changes:

- **Title**: "Edit Account"
- **Subtitle**: "Update your bank account details"
- **Button**: "Save Changes"

### 5. Delete Account Confirmation Dialog
**File:** `delete-account-modal.png`

Accounts List — Desktop as background with 40% opacity overlay (`#00000066`). Dialog (`h:1St63`) centered over the overlay, 440px wide.

**Structure:**
- **Header**: "Delete Account" title (18px, 500) + "Are you sure you want to delete \"Nubank Checking\"? This action cannot be undone." description (14px, muted)
- **Actions**: "Delete" button (Default overridden to destructive) + "Cancel" button (Outline)

## Design System Tokens Used

### Colors
| Token | Usage |
|-------|-------|
| `$h:--background` (`bg-background`) | Screen/page backgrounds |
| `$h:--foreground` (`text-foreground`) | Primary text (titles, account names, balances) |
| `$h:--card` (`bg-card`) | Card backgrounds |
| `$h:--card-foreground` (`text-card-foreground`) | Card text |
| `$h:--muted-foreground` (`text-muted-foreground`) | Labels, subtitles, hints |
| `$h:--primary` (`bg-primary`) | Primary button, EMS badge, active nav item |
| `$h:--primary-foreground` (`text-primary-foreground`) | Button text, EMS badge text |
| `$h:--secondary` (`bg-secondary`) | Secondary button |
| `$h:--destructive` (`bg-destructive`) | Delete button, delete icon |
| `$h:--destructive-foreground` (`text-destructive-foreground`) | Delete button text, delete icon fill |
| `$h:--accent` (`bg-accent`) | Input backgrounds, icon button ghost |
| `$h:--sidebar` (`bg-sidebar`) | Sidebar background |
| `$h:--sidebar-foreground` (`text-sidebar-foreground`) | Sidebar secondary text |
| `$h:--sidebar-accent` (`bg-sidebar-accent`) | Sidebar active item |
| `$h:--sidebar-accent-foreground` (`text-sidebar-accent-foreground`) | Sidebar active text |
| `$h:--sidebar-border` (`border-sidebar-border`) | Sidebar border |
| `$h:--border` (`border-border`) | Card outlines, input borders |
| `$h:--input` (`border-input`) | Input stroke |

### Typography
| Token | Usage |
|-------|-------|
| `Inter` (family) | All text (`font-sans`) |
| 28px/600 | Page title (desktop) |
| 22px/600 | Page title (mobile) |
| 20px/500 | Modal title, mobile balance |
| 18px/500 | Dialog title, desktop balance, sidebar brand |
| 16px/500 | Account name, sidebar item, modal badge |
| 14px | Body, button text, date |
| 13px | Labels, hints, subtitle |

### Spacing
| Token | Usage |
|-------|-------|
| 32px | Page padding (desktop) |
| 24px | Page header gap, card row internal gap |
| 20px | Mobile header padding, card internal padding (desktop) |
| 16px | Form gap, mobile card padding, sidebar items group |
| 14px | Mobile card internal padding (vertical) |
| 12px | Card list gap, mobile header bottom padding |
| 10px | Mobile card gap between rows |
| 8px | Sidebar margin, layout gaps, icon button gap |
| 4px | Label group gap |

### Core Components
| Component | Usage |
|-----------|-------|
| `Card` (h:ZqeIe) | Each account row in desktop list |
| `Modal/Center` (h:HwiOa) | Create/Edit account form |
| `Dialog` (h:1St63) | Delete confirmation |
| `Input Group/Default` (h:uEeaR) | Form input fields |
| `Button/Default` (h:xBc88) | New Account button |
| `Button/Large/Default` (h:PoWVd) | Modal primary action (no icon) |
| `Button/Large/Secondary` (h:yufPk) | Modal cancel action (no icon) |
| `Button/Outline` (h:L73ds) | Dialog cancel action |
| `Icon Button/Default` (h:NZ2w4) | Edit account, plus button, hamburger toggle |
| `Icon Button/Destructive` (h:Aicy4) | Delete account |
| `Icon Button/Ghost` (h:uUsbB) | Hamburger menu (mobile) |
| `Sidebar` (h:Cpvvc) | Desktop navigation |

## Tailwind CSS Mapping

**Page layout:**
```
flex flex-row w-screen h-screen
```

**Sidebar:**
```
w-64 h-full bg-sidebar border-r border-sidebar-border
```

**Sidebar logo:**
```
w-8 h-8 rounded-full bg-primary flex items-center justify-center
```
```
text-xs font-semibold text-primary-foreground
```

**Main content area:**
```
flex-1 flex flex-col gap-6 p-8
```

**Desktop account card row:**
```
w-full bg-card rounded-xl shadow-md border border-border
flex flex-row items-center gap-4 px-6 py-5
```

**Mobile top bar:**
```
flex flex-row items-center justify-between px-5 pt-4 pb-3
```

**Mobile title bar:**
```
flex flex-row items-center justify-between
```

**Mobile card:**
```
w-full bg-card rounded-xl shadow-md border border-border
flex flex-col gap-2.5 px-4 py-3.5
```

**Modal/dialog overlay:**
```
fixed inset-0 bg-black/40 flex items-center justify-center
```

**Form inputs:**
```
w-full flex flex-col gap-1.5
```
Label: `text-sm font-medium text-foreground`
Input: `h-11 w-full rounded-full bg-accent border border-input px-6 placeholder:text-muted-foreground text-sm`
