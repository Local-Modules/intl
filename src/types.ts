import type { ComponentType, ReactNode } from 'react'

/**
 * Locale registry — augment from your app to declare the locales your messages
 * use. Without augmentation, only `'en'` is required and no other locale keys
 * are permitted on message objects.
 *
 * @example
 * ```ts
 * declare module '@locmod/intl' {
 *   interface IntlLocales {
 *     RequiredLocales: 'en' | 'fr'
 *     OptionalLocales: 'es' | 'de'
 *   }
 * }
 * ```
 */
export interface IntlLocales { _: any }

type ResolveRequired = IntlLocales extends { RequiredLocales: infer R extends string } ? R : 'en'
type ResolveOptional = IntlLocales extends { OptionalLocales: infer O extends string } ? O : never

export type IntlLocale = ResolveRequired | ResolveOptional

export type IntlMessageValues = Record<string, unknown>

export type IntlMessageComponents = Record<string, ComponentType<any> | ((props: any) => ReactNode)>

export type IntlMessageTranslation =
  & { [K in ResolveRequired]: string }
  & { [K in ResolveOptional]?: string }

export type IntlMessage = IntlMessageTranslation & {
  values?: IntlMessageValues
  components?: IntlMessageComponents
}

export type IntlErrorHandler = (error: string) => void

export type IntlApi = {
  /** Currently active locale, e.g. `'en'`. Read it from `useIntl()` when you need the locale at runtime. */
  locale: IntlLocale
  /** Fallback locale used when a message has no translation for {@link Intl.locale}. `undefined` when no fallback is configured. */
  defaultLocale: IntlLocale | undefined
  /** Resolve an `IntlMessage`/`IntlMessageTranslation` to a string under the current locale. Plain strings are returned as-is. */
  formatMessage: (message: IntlMessageTranslation | string, values?: IntlMessageValues) => string
  /** Imperatively switch the active locale. Triggers a re-render of every `useIntl` consumer. */
  setLocale: (locale: IntlLocale) => void
}

/**
 * Shape stored on `IntlContext`. Extends the public `Intl` API with the
 * template-only formatter and the `onError` handler captured from
 * `<IntlProvider>` — both consumed internally by `<Message>` to compose
 * the parsed-tree rendering path. Not exported from the package entry.
 */
export type IntlInternal = IntlApi & {
  formatTemplate: (message: IntlMessageTranslation | string, values?: IntlMessageValues) => string
  onError?: IntlErrorHandler
}
