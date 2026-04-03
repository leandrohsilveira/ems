# @ems/backend-utils

Backend utilities for EMS project.

## Installation

```bash
npm install @ems/backend-utils
```

## Available Utilities

### errorHandling

Fastify plugin for centralized error handling with schema validation support.

#### Features

- **Global error handler**: Centralized error handling for all routes
- **Schema validation support**: Handles Fastify's built-in validation errors
- **Backward compatibility**: Maintains existing error response formats
- **Differentiated logging**: Server errors (5xx) logged as `error`, client errors (4xx) as `warn`
- **404 handler**: Proper handling of undefined routes

#### Usage

```javascript
import { errorHandling } from '@ems/backend-utils'
import Fastify from 'fastify'

const fastify = Fastify()

// Register error handling plugin
await fastify.register(errorHandling)

// Your routes will now have centralized error handling
fastify.get('/', () => {
    throw new Error('Something went wrong')
})
```

#### Error Response Formats

1. **Schema Validation Errors** (400):

```json
{
    "errors": {
        "email": { "message": "must match format 'email'" }
    }
}
```

2. **Existing ValidationError** (400):

```json
{
    "errors": {
        "username": { "message": "Username already exists" }
    }
}
```

3. **Generic Errors** (4xx/5xx):

```json
{
    "error": "Error message"
}
```

4. **Not Found** (404):

```json
{
    "error": "Route not found"
}
```

#### Logging

- Server errors (5xx): Logged as `error` level
- Client errors (4xx): Logged as `warn` level
- All logs include request context: `reqId`, `url`, `method`, `validationContext`

#### Backward Compatibility

The plugin maintains compatibility with:

- Existing `ValidationError` class from `@ems/domain-backend-auth`
- Existing `ValidationErrorDTO` format
- Existing per-route error handling patterns
