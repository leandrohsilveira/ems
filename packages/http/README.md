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

| Param              | Type                         | Description                                                      |
| ------------------ | ---------------------------- | ---------------------------------------------------------------- |
| `fetch`            | `Window['fetch']`            | The fetch function                                               |
| `options.baseUrl`  | `string`                     | Base URL for all requests                                        |
| `options.request`  | `ClientRequestParserInput[]` | Global request parsers (applied to every request)                |
| `options.literals` | `ClientI18nLiterals`         | I18N literals for error messages (defaults to `defaultLiterals`) |

Returns a client with methods: `get`, `post`, `put`, `patch`, `delete`, `head`, `options`, and `call`.

### HttpClient

Every method accepts a URL and `RequestOptions<T, E>`:

| Method    | Signature                                                                   |
| --------- | --------------------------------------------------------------------------- |
| `call`    | `call<T, E>(method, url, options)` — generic method with explicit HTTP verb |
| `get`     | `get<T, E>(url, options)`                                                   |
| `post`    | `post<T, E>(url, options)`                                                  |
| `put`     | `put<T, E>(url, options)`                                                   |
| `patch`   | `patch<T, E>(url, options)`                                                 |
| `delete`  | `delete<T, E>(url, options)`                                                |
| `head`    | `head<T, E>(url, options)`                                                  |
| `options` | `options<T, E>(url, options)`                                               |

All methods return `Promise<HttpResult<T, E>>`, which is either `{ ok: true, data: T }` or `{ ok: false, error: HttpError<E> }`. The default error type `E` is `DefaultErrorFormat` (`{ message: string }`), set at the client level via `HttpClient<DefErr>` and overridable per-request.

### RequestOptions

```typescript
interface RequestOptions<T, E = DefaultErrorFormat> {
    request?: RequestParserInput | RequestParserInput[]
    response: ResponseParser<T, E>
}
```

| Property   | Type                   | Description                                                          |
| ---------- | ---------------------- | -------------------------------------------------------------------- |
| `request`  | parser(s)              | Inline request parsers for this request (merged with global parsers) |
| `response` | `ResponseParser<T, E>` | Parser for the response body, determines the error type `E`          |

### Parser factories

| Factory                      | Description                                                              |
| ---------------------------- | ------------------------------------------------------------------------ |
| `jsonRequest(body)`          | Sets `Content-Type: application/json` and serializes body                |
| `bearerAuth(token)`          | Adds `Authorization: Bearer <token>` header                              |
| `jsonResponse(transformer?)` | Parses JSON response into typed `data` (on success) or `body` (on error) |
| `noResponse()`               | For endpoints that return no body                                        |

### I18N Literals

Customizable error messages via `ClientI18nLiterals`:

| Key                       | Default                                                     |
| ------------------------- | ----------------------------------------------------------- |
| `serviceUnavailableError` | `Service temporarily unavailable. Please, try again later.` |
| `somethingWentWrongError` | `Something went wrong. Please, try again later.`            |

```js
import { createHttpClient } from '@ems/http'

const client = createHttpClient(fetch, {
    baseUrl: 'https://api.example.com',
    literals: {
        serviceUnavailableError:
            'Serviço temporariamente indisponível. Tente novamente mais tarde.',
        somethingWentWrongError: 'Algo deu errado. Tente novamente mais tarde.'
    }
})
```

### Error types

`HttpError<E>` is a discriminated union based on `type`:

| Type                         | Description                                                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `NetworkError`               | Network failure (connection refused) — `type: 'NETWORK_ERROR'`                                                 |
| `HttpResponseError`          | HTTP error response (4xx/5xx) — `type: 'HTTP_ERROR'`                                                           |
| `ParsedHttpResponseError<T>` | HTTP error with parsed JSON body — `type: 'HTTP_ERROR', parsed: true, body: T`                                 |
| `ContentTypeMismatchError`   | HTTP error with unexpected content type — `type: 'HTTP_ERROR', parsed: false, reason: 'CONTENT_TYPE_MISMATCH'` |
| `UnexpectedError`            | Unexpected error (serialization failure, etc.) — `type: 'UNEXPECTED_ERROR'`                                    |

Check `error.parsed` to discriminate between raw and parsed HTTP errors:

```js
if (error.type === 'HTTP_ERROR' && error.parsed) {
    // error.body is typed as E
    console.log(error.status, error.body)
}
```

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

| Helper                                                       | Description                                                     |
| ------------------------------------------------------------ | --------------------------------------------------------------- |
| `createHttpClientStub(options?)`                             | Creates a client stub with a mocked `fetch` and a real `client` |
| `createJsonResponse({ body, status, headers })`              | Creates a `Response` with JSON body                             |
| `createTextResponse({ text, status, headers, contentType })` | Creates a `Response` with text body                             |
| `createMockResponse({ json, text, status, contentType })`    | Creates a `Response` with controllable methods                  |
| `createNetworkError(code)`                                   | Creates an error with a cause (e.g. `ECONNREFUSED`)             |
| `mockFetchWithJson({ body, status })`                        | Returns a `vi.fn()` that resolves to a JSON response            |
| `mockFetchWithText({ text, status, contentType })`           | Returns a `vi.fn()` that resolves to a text response            |
| `mockFetchWithResponse({ response })`                        | Returns a `vi.fn()` that resolves to a given response           |
