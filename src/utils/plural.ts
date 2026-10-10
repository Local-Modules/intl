// CLDR - https://www.unicode.org/cldr/charts/34/supplemental/language_plural_rules.html

export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'

type PluralFn = (n: number, ord?: boolean) => PluralCategory

const en: PluralFn = (n, ord = false) => {
  const s = String(n).split('.')
  const v0 = !s[1]
  const t0 = Number(s[0]) === n
  const n10 = t0 && Number(s[0].slice(-1))
  const n100 = t0 && Number(s[0].slice(-2))

  if (n === 0) {
    return 'zero'
  }

  if (ord) {
    if (n10 === 1 && n100 !== 11) return 'one'
    if (n10 === 2 && n100 !== 12) return 'two'
    if (n10 === 3 && n100 !== 13) return 'few'
    return 'other'
  }

  if (n === 1 && v0) return 'one'
  if (n === 2 && v0) return 'two'
  return 'other'
}

const plural: Record<string, PluralFn> = { en }

// One Intl.PluralRules per locale; `null` marks a locale the runtime has no rules for.
const intlRules = new Map<string, Intl.PluralRules | null>()

const getIntlRules = (locale: string): Intl.PluralRules | null => {
  let rules = intlRules.get(locale)

  if (rules === undefined) {
    try {
      // supportedLocalesOf filters out tags the runtime has no data for. Without it, an unknown tag would silently
      // take the runtime's default locale rules.
      rules = Intl.PluralRules.supportedLocalesOf(locale).length ? new Intl.PluralRules(locale) : null
    }
    catch {
      // An invalid language tag, or a runtime without Intl.PluralRules.
      rules = null
    }
    intlRules.set(locale, rules)
  }

  return rules
}

/**
 * Plural category of `n` in `locale`. Locales with built-in rules (`en`) keep them; every other locale uses the
 * runtime's CLDR rules through `Intl.PluralRules`. Returns `null` when the runtime has no rules for the locale.
 */
export const getPluralCategory = (locale: string, n: number): PluralCategory | null => {
  const builtIn = plural[locale]

  if (builtIn) {
    return builtIn(n)
  }

  const rules = getIntlRules(locale)

  return rules ? rules.select(n) : null
}
