# Authentication Service

## Summary

A JWT-based authentication service providing secure token lifecycle management (generation, validation, refresh, revocation) for the Expense Management System. User and role management are mocked for development and testing purposes.

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
   - Validate credentials against mocked user store
   - Hash passwords with bcrypt

2. **Token Management**
   - Generate JWT access tokens with userId, username, and roles claims
   - Generate refresh tokens with unique token ID (jti) for tracking
   - Support token refresh with rotation (new refresh token on each use)
   - Support token revocation (logout and admin revoke)

3. **Token Validation**
   - Verify JWT signature using HS256 algorithm
   - Check token expiration
   - Extract and validate user claims
   - Middleware for protecting API routes

4. **Mocked User & Role Management**
   - In-memory user store with pre-seeded test users
   - Three roles: user, manager, admin
   - Role-based permission structure

### Non-Functional Requirements

- **Security**: Tokens signed with secret key, passwords hashed, refresh tokens rotated
- **Performance**: Token validation < 10ms
- **Scalability**: In-memory store designed for single-instance; production would use Redis

## Design

### Data Model

**User (mocked)**
```
{
  id: string,
  username: string,
  passwordHash: string,
  roles: string[]
}
```

**RefreshToken (in-memory store)**
```
{
  jti: string,           # Unique token ID
  userId: string,
  hashedToken: string,   # SHA-256 hash of token
  expiresAt: Date,
  createdAt: Date
}
```

**Token Payload - Access Token**
```
{
  sub: "userId",
  username: "string",
  roles: ["string"],
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
  iat: number,
  exp: number,
  type: "refresh"
}
```

### Mocked Users

| Username | Password | Roles |
|----------|----------|-------|
| admin | admin123 | admin |
| user | user123 | user |
| manager | manager123 | user, manager |

### Mocked Roles/Permissions

| Role | Permissions |
|------|-------------|
| user | read:own |
| manager | read:own, read:all, write:transactions |
| admin | read:\*, write:\*, admin:\* |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Authenticate user, return tokens |
| POST | /auth/refresh | Exchange refresh token for new token pair |
| POST | /auth/logout | Revoke refresh token |
| POST | /auth/revoke-all | Revoke all tokens for a user |
| GET | /auth/me | Get current user info (protected) |

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
  "message": "All tokens revoked"
}
```

**GET /auth/me** (Protected)

Response (200):
```json
{
  "userId": "string",
  "username": "string",
  "roles": ["string"]
}
```

## Technical Approach

- **Language**: JavaScript with JSDoc
- **Runtime**: Node.js
- **JWT Library**: jsonwebtoken
- **Password Hashing**: bcrypt
- **Token Storage**: In-memory Map (mocked, production would use Redis)
- **Algorithm**: HS256 for JWT signing

### Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| JWT_SECRET | (required) | Secret key for signing tokens |
| ACCESS_TOKEN_TTL | 900 | Access token lifetime in seconds (15 min) |
| REFRESH_TOKEN_TTL | 604800 | Refresh token lifetime in seconds (7 days) |

## Dependencies

- `jsonwebtoken`: JWT generation and verification
- `bcrypt`: Password hashing
- No external services required (mocked implementation)

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Refresh token theft | Token rotation invalidates stolen tokens on use |
| Secret key exposure | Use strong secrets, rotate periodically |
| In-memory store loss on restart | Production would persist to Redis/database |

## Acceptance Criteria

- [ ] User can login with valid credentials and receive access + refresh tokens
- [ ] Invalid credentials return 401 error with appropriate message
- [ ] Access token can be used to authenticate protected endpoints
- [ ] Expired access token returns 401 with "token expired" message
- [ ] Valid refresh token can be exchanged for new token pair
- [ ] Refresh token rotation works (new refresh token issued, old invalidated)
- [ ] Logout invalidates the refresh token immediately
- [ ] All user tokens can be revoked at once by admin
- [ ] Protected endpoints reject requests without valid access token
- [ ] Token claims (userId, username, roles) are correctly extracted from access token

## Out of Scope

- User registration/signup flow
- Password reset functionality
- OAuth/SSO integration
- Multi-factor authentication
- Persistent token storage (Redis/database)
- Rate limiting
