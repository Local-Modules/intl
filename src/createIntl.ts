import formatMessage from './formatMessage'
import formatTemplate, { MISSED_TRANSLATION } from './formatTemplate'
import type {
  IntlApi, IntlErrorHandler, IntlInternal, IntlLocale, IntlMessageTranslation, IntlMessageValues,
} from './types'

type CreateIntlOptions = {
  locale: IntlLocale
  setLocale: (locale: IntlLocale) => void
  defaultLocale?: IntlLocale
  onError?: IntlErrorHandler
}

/**
 * Internal builder — produces the full context-side shape (`Intl` plus
 * `formatTemplate` and the captured `onError`). Exported for `IntlProvider`;
 * not part of the public API.
 */
export const createIntlInternal = ({ locale, setLocale, defaultLocale, onError }: CreateIntlOptions): IntlInternal => ({
  locale,
  defaultLocale,
  setLocale,
  onError,
  formatMessage: (message: IntlMessageTranslation | string, values?: IntlMessageValues) =>
    formatMessage(locale, message, values, onError, defaultLocale),
  formatTemplate: (message: IntlMessageTranslation | string, values?: IntlMessageValues) => {
    const { template, missing } = formatTemplate(locale, message, values, onError, defaultLocale)
    return missing ? MISSED_TRANSLATION : template
  },
})

/**
 * Build the `intl` object that `IntlProvider` stores on context.
 *
 * Most apps don't call this directly — render `<IntlProvider>` and read the
 * result with `useIntl()`. Use `createIntl` when you need to format messages
 * outside of React (tests, server rendering helpers, etc).
 */
const createIntl = (opts: CreateIntlOptions): IntlApi => createIntlInternal(opts)

export default createIntl
