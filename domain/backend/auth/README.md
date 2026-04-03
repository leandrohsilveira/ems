# Auth Middleware - Usage Examples

This package provides authentication middleware for Fastify with permission-based access control.

## Installation

```bash
npm install @ems/domain-backend-auth
```

## Basic Usage

### 1. Register the Auth Plugin

```javascript
import Fastify from 'fastify'
import authPlugin from '@ems/domain-backend-auth'

const app = Fastify()

// Register auth plugin with required services
await app.register(authPlugin, {
    authService, // Your AuthService instance
    userService // Your UserService instance
})
```

### 2. Using the `authenticate` Decorator

The `authenticate` decorator validates JWT tokens and sets `request.user`:

```javascript
// Protect a route with authentication
app.get('/protected', {
    preHandler: app.authenticate,
    handler: async (request, reply) => {
        return { message: 'Authenticated!', user: request.user }
    }
})
```

### 3. Using the `allowOneOf` Decorator (NEW)

The `allowOneOf` decorator checks if the authenticated user has at least one of the specified permissions:

```javascript
import { PERMISSIONS } from '@ems/domain-backend-auth'

// Example 1: Require specific permission
app.get('/admin/users', {
    preHandler: app.allowOneOf([PERMISSIONS.USER_READ]),
    handler: async (request, reply) => {
        return {
            message: 'Access granted to user list',
            users: [] // Your user data
        }
    }
})

// Example 2: Require one of multiple permissions
app.post('/admin/users', {
    preHandler: app.allowOneOf([PERMISSIONS.USER_WRITE, PERMISSIONS.USER_DELETE]),
    handler: async (request, reply) => {
        return {
            message: 'User created/updated',
            user: request.body
        }
    }
})

// Example 3: Admin-only endpoint
app.delete('/admin/users/:id', {
    preHandler: app.allowOneOf([PERMISSIONS.USER_DELETE]),
    handler: async (request, reply) => {
        return {
            message: `User ${request.params.id} deleted`
        }
    }
})
```

## Available Permissions

The system includes the following permissions (defined in `PERMISSIONS` constant):

| Permission        | Description               | Available to Roles   |
| ----------------- | ------------------------- | -------------------- |
| `auth:me`         | View own user information | USER, MANAGER, ADMIN |
| `auth:revoke-all` | Revoke all user sessions  | ADMIN                |
| `user:read`       | Read user information     | MANAGER, ADMIN       |
| `user:write`      | Create/update users       | MANAGER, ADMIN       |
| `user:delete`     | Delete users              | ADMIN                |

## Role-Based Permissions

Permissions are automatically mapped to roles:

- **USER**: `auth:me`
- **MANAGER**: `auth:me`, `user:read`, `user:write`
- **ADMIN**: `auth:me`, `auth:revoke-all`, `user:read`, `user:write`, `user:delete`

## Error Responses

### Authentication Errors (401)

```json
{
    "error": "Authorization header required"
}
```

```json
{
    "error": "Invalid authorization format"
}
```

```json
{
    "error": "Invalid or expired token",
    "message": "Token validation failed"
}
```

### Permission Errors (403)

```json
{
    "error": "Insufficient permissions"
}
```

## TypeScript Support

Type definitions are included. The Fastify instance is augmented with:

```typescript
declare module 'fastify' {
    interface FastifyRequest {
        user: UserDTO | null
    }

    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void> | void
        allowOneOf: (
            permissions: string[]
        ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void> | void
    }
}
```

## Complete Example

```javascript
import Fastify from 'fastify'
import authPlugin, { PERMISSIONS } from '@ems/domain-backend-auth'

const app = Fastify()

// Setup your services (implementation depends on your setup)
const authService = createAuthService(...)
const userService = createUserService(...)

// Register plugin
await app.register(authPlugin, { authService, userService })

// Public endpoints (no authentication required)
app.post('/login', ...)    // Built-in
app.post('/signup', ...)   // Built-in
app.post('/refresh', ...)  // Built-in
app.post('/logout', ...)   // Built-in

// Protected endpoints
app.get('/me', {           // Built-in - requires auth:me
  preHandler: app.allowOneOf([PERMISSIONS.AUTH_ME]),
  handler: async (request, reply) => {
    return { user: request.user }
  }
})

app.post('/revoke-all', {  // Built-in - requires auth:revoke-all
  preHandler: app.allowOneOf([PERMISSIONS.AUTH_REVOKE_ALL]),
  handler: async (request, reply) => {
    // Admin-only functionality
  }
})

// Custom protected endpoints
app.get('/dashboard', {
  preHandler: app.authenticate, // Just authentication, no specific permissions
  handler: async (request, reply) => {
    return { message: 'Welcome to your dashboard!' }
  }
})

app.get('/admin/reports', {
  preHandler: app.allowOneOf([PERMISSIONS.USER_READ, PERMISSIONS.USER_WRITE]),
  handler: async (request, reply) => {
    return { reports: [] } // Accessible to MANAGER and ADMIN
  }
})

// Start server
await app.listen({ port: 3000 })
```

## Testing

When testing routes protected with `allowOneOf`, ensure your mock user has the appropriate role:

```javascript
// Test for ADMIN endpoint
const mockAdminUser = {
    userId: 'admin-1',
    username: 'admin',
    role: 'ADMIN' // Has all permissions
}

// Test for MANAGER endpoint
const mockManagerUser = {
    userId: 'manager-1',
    username: 'manager',
    role: 'MANAGER' // Has user:read and user:write
}

// Test for USER endpoint
const mockRegularUser = {
    userId: 'user-1',
    username: 'user',
    role: 'USER' // Only has auth:me
}
```

## Best Practices

1. **Use `allowOneOf` for permission-based access control**
2. **Use `authenticate` for simple authentication-only routes**
3. **Always import permissions from `PERMISSIONS` constant** instead of hardcoding strings
4. **Test with different user roles** to ensure proper access control
5. **Combine with request validation** for complete endpoint security

## Migration from `authenticate` to `allowOneOf`

If you were previously using only `authenticate`, you can now add permission checks:

```javascript
// Before: Only authentication
app.get('/me', {
  preHandler: app.authenticate,
  handler: ...
})

// After: Authentication + permission check
app.get('/me', {
  preHandler: app.allowOneOf([PERMISSIONS.AUTH_ME]),
  handler: ...
})
```

The `allowOneOf` decorator automatically calls `authenticate` internally, so you don't need to use both.
