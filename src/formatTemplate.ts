import replacePluralVariables from './utils/replacePluralVariables'
import replaceSelectVariables from './utils/replaceSelectVariables'
import stripSpaces from './utils/stripSpaces'
import type { IntlErrorHandler, IntlMessageTranslation, IntlMessageValues } from './types'

/** Returned in place of a translation when the message is empty or has no entry for the active locale (and no `defaultLocale` fallback resolved). */
export const MISSED_TRANSLATION = '{{ missed_translation }}'

export type FormatTemplateResult = {
  /** Template string with `{key}` placeholders intact (or the `MISSED_TRANSLATION` sentinel). */
  template: string
  /** Locale of the chosen translation — equals `locale` or the fallback `defaultLocale`. */
  resolvedLocale: string
  /** True when no translation resolved and the sentinel is returned. */
  missing: boolean
}

/**
 * Run the locale-resolving half of the formatMessage pipeline.
 *
 * `stripSpaces → select → plural` only — simple `{key}` substitution is
 * deliberately skipped so callers (e.g. the HTML/components parser) can
 * interpolate placeholders into a React tree as text children instead of
 * splicing them into a string.
 */
const formatTemplate = (
  locale: string,
  message: IntlMessageTranslation | string | null | undefined,
  values?: IntlMessageValues,
  onError?: IntlErrorHandler,
  defaultLocale?: string
): FormatTemplateResult => {
  if (typeof message === 'string') {
    return { template: message, resolvedLocale: locale, missing: false }
  }

  if (!message) {
    onError?.('formatMessage called with empty message')
    return { template: MISSED_TRANSLATION, resolvedLocale: locale, missing: true }
  }

  const translations = message as Record<string, string | undefined>
  let translation = translations[locale]
  let resolvedLocale = locale

  if (typeof translation !== 'string' && defaultLocale && defaultLocale !== locale) {
    const fallback = translations[defaultLocale]
    if (typeof fallback === 'string') {
      translation = fallback
      resolvedLocale = defaultLocale
    }
  }

  if (typeof translation !== 'string') {
    onError?.(`Missing translation for locale "${locale}"`)
    return { template: MISSED_TRANSLATION, resolvedLocale: locale, missing: true }
  }

  let result = stripSpaces(translation)
  result = replaceSelectVariables(result, values, onError)
  result = replacePluralVariables(result, values, resolvedLocale, onError)

  return { template: result, resolvedLocale, missing: false }
}

export default formatTemplate
