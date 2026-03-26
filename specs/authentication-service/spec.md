# Authentication Service

## Summary

A JWT-based authentication service providing secure token lifecycle management (generation, validation, refresh, revocation) for the Expense Management System. User authentication uses the database via Prisma, with session management for refresh token tracking.

## Problem Statement

The Expense Management System requires secure user authentication to protect financial data. Users need a reliable way to authenticate, maintain sessions across requests, and manage their access securely without repeated login attempts.

## User Stories

- **As a** registered user, **I want to** log in with my credentials, **so that** I can access my financial data securely
- **As a** authenticated user, **I want to** stay logged in without re-entering credentials frequently, **so that** I can work efficiently
- **As a** user, **I want to** log out and invalidate my tokens, **so that** I can secure my account on shared devices
- **As a** system administrator, **I want to** revoke all tokens for a user, **so that** I can respond to security incidents
- **As a** user, **I want to** have my session extended automatically via refresh tokens, **so that** I don't lose work during long sessions

## Requirements

### Functional Requirements

1. **User Authentication**
   - Login with username/password credentials
   - Return JWT access token (short-lived) and refresh token (long-lived)
   - Validate credentials against database via Prisma
   - Hash passwords with bcrypt

2. **Session Management**
   - Create session on login with userId, jti, lastRefresh, and expiresAt
   - Update session's jti and lastRefresh on token refresh
   - Validate session jti matches refresh token jti to invalidate previous tokens
   - Delete session on logout
   - Delete all user sessions on revoke-all

3. **Token Management**
   - Generate JWT access tokens with userId, username, and role claim
   - Generate refresh tokens with unique token ID (jti) and sessionId claim
   - Support token refresh with rotation (new refresh token on each use)
   - Invalidate previous refresh tokens by updating session jti
   - Stateless refresh tokens - session tracked in database

4. **Token Validation**
   - Verify JWT signature using HS256 algorithm
   - Check token expiration
   - Extract and validate user claims
   - Validate session exists, is not expired, and jti matches
   - Middleware for protecting API routes

### Non-Functional Requirements

- **Security**: Tokens signed with secret key, passwords hashed, refresh tokens rotated
- **Performance**: Token validation < 10ms
- **Scalability**: Session storage in database for multi-instance support

## Design

### Data Model

**User (Prisma schema)**

```
{
  id: string,
  firstName: string | null,
  lastName: string | null,
  email: string (unique),
  username: string (unique),
  password: string,
  role: Role (USER | MANAGER | ADMIN)
}
```

**Session (new model)**

```
{
  id: string,
  userId: string,
  jti: string,           // Current valid refresh token ID
  lastRefresh: DateTime,
  expiresAt: DateTime
}
```

**Token Payload - Access Token**

```
{
  sub: "userId",
  username: "string",
  role: "string",
  iat: number,
  exp: number,
  type: "access"
}
```

**Token Payload - Refresh Token**

```
{
  sub: "userId",
  jti: "unique-token-id",
  sessionId: "string",
  iat: number,
  exp: number,
  type: "refresh"
}
```

### API Endpoints

| Method | Endpoint         | Description                                               |
| ------ | ---------------- | --------------------------------------------------------- |
| POST   | /auth/login      | Authenticate user, create session, return tokens          |
| POST   | /auth/refresh    | Exchange refresh token for new token pair, update session |
| POST   | /auth/logout     | Delete session                                            |
| POST   | /auth/revoke-all | Delete all sessions for a user                            |
| GET    | /auth/me         | Get current user info (protected)                         |

### API Request/Response Formats

**POST /auth/login**

Request:

```json
{
  "username": "string",
  "password": "string"
}
```

Response (200):

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

**POST /auth/refresh**

Request:

```json
{
  "refreshToken": "string"
}
```

Response (200):

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

**POST /auth/logout**

Request:

```json
{
  "refreshToken": "string"
}
```

Response (200):

```json
{
  "message": "Logged out successfully"
}
```

**POST /auth/revoke-all**

Request:

```json
{
  "userId": "string"
}
```

Response (200):

```json
{
  "message": "All sessions revoked"
}
```

**GET /auth/me** (Protected)

Response (200):

```json
{
  "userId": "string",
  "username": "string",
  "firstName": "string | null",
  "lastName": "string | null",
  "email": "string",
  "role": "string"
}
```

## Technical Approach

- **Language**: JavaScript with JSDoc
- **Runtime**: Node.js
- **Database**: PostgreSQL via Prisma
- **JWT Library**: jsonwebtoken
- **Password Hashing**: bcrypt
- **Algorithm**: HS256 for JWT signing

### Configuration

| Variable               | Default    | Description                                |
| ---------------------- | ---------- | ------------------------------------------ |
| AUTH_JWT_SECRET        | (required) | Secret key for signing tokens              |
| AUTH_ACCESS_TOKEN_TTL  | 900        | Access token lifetime in seconds (15 min)  |
| AUTH_REFRESH_TOKEN_TTL | 604800     | Refresh token lifetime in seconds (7 days) |

## Dependencies

- `jsonwebtoken`: JWT generation and verification
- `bcrypt`: Password hashing
- `@prisma/client`: Database access
- Database: PostgreSQL with User and Session models

## Risks & Mitigations

| Risk                 | Mitigation                                      |
| -------------------- | ----------------------------------------------- |
| Refresh token theft  | Token rotation invalidates stolen tokens on use |
| Secret key exposure  | Use strong secrets, rotate periodically         |
| Session table growth | Session cleanup (see Out of Scope)              |

## Acceptance Criteria

- [ ] User can login with valid credentials and receive access + refresh tokens
- [ ] Session is created on login and tracked in database
- [ ] Invalid credentials return 401 error with appropriate message
- [ ] Access token can be used to authenticate protected endpoints
- [ ] Expired access token returns 401 with "token expired" message
- [ ] Valid refresh token can be exchanged for new token pair
- [ ] Refresh token rotation works (new refresh token issued, old invalidated via jti)
- [ ] Session is updated with new jti and lastRefresh on token refresh
- [ ] Previous refresh tokens become invalid after refresh (jti mismatch)
- [ ] Logout deletes the session immediately
- [ ] All user sessions can be revoked at once by admin
- [ ] Protected endpoints reject requests without valid access token
- [ ] Protected endpoints reject requests when session is expired, deleted, or jti mismatch
- [ ] Token claims (userId, username, role) are correctly extracted from access token

## Out of Scope

- User registration/signup flow
- Password reset functionality
- OAuth/SSO integration
- Multi-factor authentication
- Session cleanup cron job to remove expired sessions
- Rate limiting
