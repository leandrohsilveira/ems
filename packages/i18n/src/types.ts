export type I18nInput = Record<string, string>

export type Literals<L extends string, T extends I18nInput, I extends Imports<L> | undefined> = T &
    (I extends Imports<L>
        ? {
              [K in keyof I]: I[K]['default']
          }
        : {})

export interface I18n<L extends string, T extends I18nInput, I extends Imports<L> | undefined> {
    scope: Record<L | 'default', T>
    imports?: I
    default: Literals<L, T, I>
    alternatives: Record<L, Literals<L, T, I>>
}

export type Imports<L extends string = string> = Record<string, I18n<L, I18nInput, Imports<L>>>

export interface I18nOptions<
    L extends string,
    T extends I18nInput,
    I extends Imports<L> | undefined
> {
    imports?: I
    default: T
    alternatives: Record<L, T>
}

export type InferLiterals<T extends I18n<any, any, any>> = T['default']
