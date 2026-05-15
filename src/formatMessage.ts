import replaceSimpleVariables from './utils/replaceSimpleVariables'
import formatTemplate, { MISSED_TRANSLATION } from './formatTemplate'
import type { IntlErrorHandler, IntlMessageTranslation, IntlMessageValues } from './types'

export { MISSED_TRANSLATION }

/**
 * Resolve a message translation for `locale` and substitute every placeholder.
 *
 * Returns a plain string. Pipeline order (load-bearing):
 *   stripSpaces → select → plural → simple
 *
 * select/plural must run before simple substitution so that nested `{key}`
 * placeholders inside clauses (e.g. `{count, plural, one {# product}}`)
 * survive long enough to be filled by `#`.
 *
 * @param locale         Active locale; used to pick `message[locale]` and to resolve plural rules.
 * @param message        A translation map (`{ en, es?, ... }`) or a plain string (returned as-is).
 * @param values         Placeholder values referenced by the message body.
 * @param onError        Invoked when the message is empty, a translation is missing, or a placeholder cannot be resolved.
 * @param defaultLocale  Fallback locale used when `message[locale]` is absent. Plural rules use the resolved locale (the one the returned text is in).
 */
const formatMessage = (
  locale: string,
  message: IntlMessageTranslation | string | null | undefined,
  values?: IntlMessageValues,
  onError?: IntlErrorHandler,
  defaultLocale?: string
): string => {
  const { template, missing } = formatTemplate(locale, message, values, onError, defaultLocale)

  if (missing) {
    return MISSED_TRANSLATION
  }

  return replaceSimpleVariables(template, values) || MISSED_TRANSLATION
}

export default formatMessage
