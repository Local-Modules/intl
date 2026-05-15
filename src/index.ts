export { default as IntlProvider } from './IntlProvider'
export { default as Message } from './Message'
export { default as useIntl } from './useIntl'
export { default as createIntl } from './createIntl'
export { default as formatMessage, MISSED_TRANSLATION } from './formatMessage'

export type {
  IntlApi,
  IntlLocales,
  IntlLocale,
  IntlMessage,
  IntlMessageTranslation,
  IntlMessageValues,
  IntlMessageComponents,
  IntlErrorHandler,
} from './types'

// Legacy global `Intl.Message*` namespace kept for backwards-compat with apps
// that reference these types directly via `/// <reference types="@locmod/intl" />`.
// Prefer the module exports (`IntlMessage`, `IntlMessageTranslation`) in new code.
declare global {
  namespace Intl {
    type MessageValues = Record<string, unknown>
    type MessageComponents = Record<string, unknown>
    type MessageTranslation = Record<string, string>

    type Message = MessageTranslation & {
      values?: MessageValues
      components?: MessageComponents
    }

    type Components = Record<string, unknown>
  }
}
