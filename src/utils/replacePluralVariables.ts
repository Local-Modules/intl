import plural from './plural'
import getVariableValues from './getVariableValues'
import type { IntlErrorHandler, IntlMessageValues } from '../types'

const variableRegex = /{\w+, plural,(\s\w+ {#?[^#}]+}){2,}}/g

/**
 * message: "{count, plural, one {# product} other {# products}}"
 * values:  { count: 23 }
 * result:  "23 products"
 */
const replacePluralVariables = (
  message: string,
  values: IntlMessageValues | undefined,
  locale: string,
  onError?: IntlErrorHandler
): string => {
  const variables = message.match(variableRegex)
  if (!variables?.length) {
    return message
  }

  try {
    return variables.reduce((acc, variable) => {
      const variableValues = getVariableValues(variable)
      const valueKeyMatch = variable.match(/[^,{]+/)
      if (!valueKeyMatch) {
        return acc
      }
      const valueKey = valueKeyMatch[0]
      const value = values ? values[valueKey] : null

      let variableKey: string
      let result: string

      if (value === null || value === undefined) {
        variableKey = 'other' in variableValues ? 'other' : Object.keys(variableValues)[0]
        result = variableValues[variableKey].replace(/#\s?/g, '')
      }
      else {
        const pluralFn = plural[locale]
        if (!pluralFn) {
          onError?.(`No plural rules for locale "${locale}", falling back to "other"`)
          variableKey = 'other'
        }
        else {
          variableKey = pluralFn(Number(value))
          if (!variableValues[variableKey]) {
            variableKey = 'other'
          }
        }
        result = (variableValues[variableKey] ?? '').replace(/#/g, String(value))
      }

      return acc.replace(variable, result)
    }, message)
  }
  catch (err) {
    onError?.(`replacePluralVariables failed: ${(err as Error).message}`)
    return message
  }
}

export default replacePluralVariables
