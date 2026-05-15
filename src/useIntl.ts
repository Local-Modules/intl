import { useContext } from 'react'

import IntlContext from './IntlContext'
import type { IntlApi } from './types'

/**
 * Access the `intl` object from the nearest `<IntlProvider>`.
 *
 * Returns the active `locale`, the configured `defaultLocale`, `formatMessage`,
 * and `setLocale`. Throws if rendered outside of an `<IntlProvider>`.
 *
 * @example
 * ```tsx
 * const { locale, formatMessage, setLocale } = useIntl()
 * ```
 */
const useIntl = (): IntlApi => {
  const intl = useContext(IntlContext)
  if (!intl) {
    throw new Error('useIntl must be used within an <IntlProvider>')
  }
  return intl
}

export default useIntl
