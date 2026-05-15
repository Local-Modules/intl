import type { IntlMessageValues } from '../types'

/**
 * Replace bare {key} placeholders with values.
 *
 * message: "Price - ${value}"
 * values:  { value: 100 }
 * result:  "Price - $100"
 *
 * NOTE: we match per-key (not "find every {x}") to avoid clobbering placeholders
 * inside select/plural clauses — those must already be resolved before this runs.
 */
const replaceSimpleVariables = (message: string, values: IntlMessageValues = {}): string =>
  Object.keys(values).reduce((res, key) => {
    const value = values[key]
    if (value === null || value === undefined) {
      return res
    }
    // Lambda form sidesteps a Safari 11 bug where `'{value}'.replace(/{value}/g, '$14.95')`
    // is interpreted as a `$1` backreference and silently drops the leading character.
    return res.replace(new RegExp(`{${key}}`, 'g'), () => String(value))
  }, message)

export default replaceSimpleVariables
