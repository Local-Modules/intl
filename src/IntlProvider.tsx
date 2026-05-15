import { useState, useMemo, type ReactNode } from 'react'

import IntlContext from './IntlContext'
import { createIntlInternal } from './createIntl'
import type { IntlErrorHandler, IntlLocale } from './types'

type IntlProviderProps = {
  /** Active locale. Used as the initial value; switch at runtime via `useIntl().setLocale(...)`. */
  locale: IntlLocale
  /**
   * Fallback locale used when a message has no translation for the active locale.
   * When omitted, missing translations resolve to `MISSED_TRANSLATION`.
   */
  defaultLocale?: IntlLocale
  /** Called with a human-readable string whenever a message can't be fully resolved (missing translation, missing placeholder value, unknown plural rule, …). */
  onError?: IntlErrorHandler
  children?: ReactNode
}

/**
 * Provides the `intl` object (current locale, `formatMessage`, `setLocale`) to
 * descendant components. Read it with `useIntl()` or render `<Message>`.
 *
 * @example
 * ```tsx
 * <IntlProvider locale="es" defaultLocale="en" onError={console.warn}>
 *   <App />
 * </IntlProvider>
 * ```
 */
const IntlProvider = ({ locale: initialLocale, defaultLocale, onError, children }: IntlProviderProps) => {
  const [ locale, setLocale ] = useState(initialLocale)

  const intl = useMemo(
    () => createIntlInternal({ locale, setLocale, defaultLocale, onError }),
    [ locale, defaultLocale, onError ]
  )

  return <IntlContext.Provider value={intl}>{children}</IntlContext.Provider>
}

export default IntlProvider
