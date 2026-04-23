# @ems/http

Typed HTTP client for browser/server environments with request/response parser pipeline.

## Usage

```js
import { createHttpClient, jsonRequest, jsonResponse } from '@ems/http'

const client = createHttpClient(fetch, { baseUrl: 'https://api.example.com' })

const { ok, data, error } = await client.post('/auth/login', {
    request: jsonRequest({ username: 'foo', password: 'bar' }),
    response: jsonResponse()
})

if (ok) {
    console.log('Tokens:', data)
} else if (error.type === 'NETWORK_ERROR') {
    // Network failure (ECONNREFUSED)
} else if (error.type === 'HTTP_ERROR') {
    // Server responded with non-2xx status
    console.log(`Status ${error.status}:`, error.body)
}
```

## API

### `createHttpClient(fetch, options?)`

Creates an HTTP client.

| Param | Type | Description |
|-------|------|-------------|
| `fetch` | `Window['fetch']` | The fetch function |
| `options.baseUrl` | `string` | Base URL for all requests |
| `options.request` | `ClientRequestParserInput[]` | Global request parsers (applied to every request) |

Returns a client with methods: `get`, `post`, `put`, `patch`, `delete`, `head`, `options`, and `call`.

### HttpClient

Every method accepts a URL and `RequestOptions<T>`:

| Method | Signature |
|--------|-----------|
| `call` | `call<T>(method, url, options)` — generic method with explicit HTTP verb |
| `get` | `get<T>(url, options)` |
| `post` | `post<T>(url, options)` |
| `put` | `put<T>(url, options)` |
| `patch` | `patch<T>(url, options)` |
| `delete` | `delete<T>(url, options)` |
| `head` | `head<T>(url, options)` |
| `options` | `options<T>(url, options)` |

All methods return `Promise<HttpResult<T>>`, which is either `{ ok: true, data: T }` or `{ ok: false, error: HttpError }`.

### RequestOptions

```typescript
interface RequestOptions<T> {
    request?: RequestParserInput | RequestParserInput[]
    response: ResponseParser<T>
}
```

| Property | Type | Description |
|----------|------|-------------|
| `request` | parser(s) | Inline request parsers for this request (merged with global parsers) |
| `response` | `ResponseParser<T>` | Parser for the response body |

### Parser factories

| Factory | Description |
|---------|-------------|
| `jsonRequest(body)` | Sets `Content-Type: application/json` and serializes body |
| `bearerAuth(token)` | Adds `Authorization: Bearer <token>` header |
| `jsonResponse(transformer?)` | Parses JSON response, optionally transforms data |
| `noResponse()` | For endpoints that return no body |

### Error types (`error.type`)

| Type | Description |
|------|-------------|
| `NETWORK_ERROR` | Network failure (connection refused) |
| `HTTP_ERROR` | HTTP error response (4xx/5xx) |
| `UNEXPECTED_ERROR` | Unexpected error (serialization failure, etc.) |

## Testing

```js
import {
    createHttpClientStub,
    createJsonResponse,
    createNetworkError,
    createMockResponse,
    mockFetchWithJson,
    mockFetchWithResponse
} from '@ems/http/testing'

const { client, fetch: fetchMock } = createHttpClientStub({ baseUrl: 'http://localhost' })
fetchMock.mockResolvedValue(createJsonResponse({ body: { id: 1 }, status: 201 }))
```

Full testing helpers:

| Helper | Description |
|--------|-------------|
| `createHttpClientStub(options?)` | Creates a client stub with a mocked `fetch` and a real `client` |
| `createJsonResponse({ body, status, headers })` | Creates a `Response` with JSON body |
| `createTextResponse({ text, status, headers, contentType })` | Creates a `Response` with text body |
| `createMockResponse({ json, text, status, contentType })` | Creates a `Response` with controllable methods |
| `createNetworkError(code)` | Creates an error with a cause (e.g. `ECONNREFUSED`) |
| `mockFetchWithJson({ body, status })` | Returns a `vi.fn()` that resolves to a JSON response |
| `mockFetchWithText({ text, status, contentType })` | Returns a `vi.fn()` that resolves to a text response |
| `mockFetchWithResponse({ response })` | Returns a `vi.fn()` that resolves to a given response |
