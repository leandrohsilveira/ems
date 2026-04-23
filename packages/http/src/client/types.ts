export type MaybePromise<T> = Promise<T> | T

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export interface RequestContext {
    url: string
    method: RequestMethod
    headers?: Record<string, string | null | undefined>
    query?: Record<string, string[] | string | null | undefined>
    body?: unknown
}

export interface RequestParserResult {
    headers?: Record<string, string | null | undefined>
    query?: Record<string, string[] | string | null | undefined>
    body?: BodyInit | null | undefined
}

export type RequestParser = () => MaybePromise<RequestParserResult>

export type RequestParserInput = RequestParser | RequestParserResult

export type ClientRequestParserResult = Pick<RequestParserResult, 'headers' | 'query'>

export type ClientRequestParser = () => MaybePromise<ClientRequestParserResult>

export type ClientRequestParserInput = ClientRequestParserResult | ClientRequestParser

export interface ResponseParser<T> {
    parse: (response: Response, request: RequestContext) => MaybePromise<HttpResult<T>>
    accepts?: string | string[]
}

export interface RequestOptions<T> {
    request?: RequestParserInput | RequestParserInput[]
    response: ResponseParser<T>
}

export type ClientI18nLiterals = Record<
    'serviceUnavailableError' | 'somethingWentWrongError',
    string
>

export interface HttpClientOptions {
    baseUrl?: string
    request?: ClientRequestParserInput | ClientRequestParserInput[]
    literals?: ClientI18nLiterals
}

interface AbstractError {
    message: string
    context: RequestContext
}

interface NetworkError extends AbstractError {
    type: 'NETWORK_ERROR'
}

interface UnexpectedError extends AbstractError {
    type: 'UNEXPECTED_ERROR'
}

interface HttpResponseError extends AbstractError {
    type: 'HTTP_ERROR'
    parsed: boolean
    status: number
    headers: Record<string, string>
    response: Response
}

interface ContentTypeMismatchError extends HttpResponseError {
    parsed: false
    reason: 'CONTENT_TYPE_MISMATCH'
    expected: string
    received: string
    body: string
}

interface ParsedHttpResponseError<T> extends HttpResponseError {
    parsed: true
    contentType: string
    body: T
}

export interface DefaultErrorFormat {
    message: string
}

export type HttpError<T> =
    | UnexpectedError
    | NetworkError
    | ContentTypeMismatchError
    | ParsedHttpResponseError<T>
export type HttpErrorResult<T> = { ok: false; data?: undefined; error: HttpError<T> }
export type HttpOkResult<T> = { ok: true; data: T; error?: undefined }
export type HttpResult<T, E = DefaultErrorFormat> = HttpOkResult<T> | HttpErrorResult<E>

export interface HttpClient {
    call: <T>(
        method: RequestMethod,
        url: string,
        options: RequestOptions<T>
    ) => Promise<HttpResult<T>>
    get: <T>(url: string, options: RequestOptions<T>) => Promise<HttpResult<T>>
    post: <T>(url: string, options: RequestOptions<T>) => Promise<HttpResult<T>>
    put: <T>(url: string, options: RequestOptions<T>) => Promise<HttpResult<T>>
    patch: <T>(url: string, options: RequestOptions<T>) => Promise<HttpResult<T>>
    delete: <T>(url: string, options: RequestOptions<T>) => Promise<HttpResult<T>>
    head: <T>(url: string, options: RequestOptions<T>) => Promise<HttpResult<T>>
    options: <T>(url: string, options: RequestOptions<T>) => Promise<HttpResult<T>>
}
