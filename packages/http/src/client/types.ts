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

export interface ResponseParser<T, E> {
    parse: (response: Response, request: RequestContext) => MaybePromise<HttpResult<T, E>>
    accepts?: string | string[]
}

export interface RequestOptions<T, E> {
    request?: RequestParserInput | RequestParserInput[]
    response: ResponseParser<T, E>
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
interface HttpResponseError extends AbstractError {
    type: 'HTTP_ERROR'
    parsed: boolean
    status: number
    headers: Record<string, string>
    response: Response
}

export interface NetworkError extends AbstractError {
    type: 'NETWORK_ERROR'
}

export interface UnexpectedError extends AbstractError {
    type: 'UNEXPECTED_ERROR'
}

export interface ContentTypeMismatchError extends HttpResponseError {
    parsed: false
    reason: 'CONTENT_TYPE_MISMATCH'
    expected: string
    received: string
    body: string
}

export interface ParsedHttpResponseError<T> extends HttpResponseError {
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
export type HttpResult<T, E> = HttpOkResult<T> | HttpErrorResult<E>

export interface HttpClient<DefErr = DefaultErrorFormat> {
    call: <T, E = DefErr>(
        method: RequestMethod,
        url: string,
        options: RequestOptions<T, E>
    ) => Promise<HttpResult<T, E>>
    get: <T, E = DefErr>(url: string, options: RequestOptions<T, E>) => Promise<HttpResult<T, E>>
    post: <T, E = DefErr>(url: string, options: RequestOptions<T, E>) => Promise<HttpResult<T, E>>
    put: <T, E = DefErr>(url: string, options: RequestOptions<T, E>) => Promise<HttpResult<T, E>>
    patch: <T, E = DefErr>(url: string, options: RequestOptions<T, E>) => Promise<HttpResult<T, E>>
    delete: <T, E = DefErr>(url: string, options: RequestOptions<T, E>) => Promise<HttpResult<T, E>>
    head: <T, E = DefErr>(url: string, options: RequestOptions<T, E>) => Promise<HttpResult<T, E>>
    options: <T, E = DefErr>(
        url: string,
        options: RequestOptions<T, E>
    ) => Promise<HttpResult<T, E>>
}
