import getVariableValues from './getVariableValues'
import type { IntlErrorHandler, IntlMessageValues } from '../types'

const variableRegex = /{\w+, select,(\s\w+ {[^}]+}){2,}}/g

/**
 * message: "{sex, select, female {perfume} male {cologne} unisex {fragrance}}"
 * values:  { sex: 'female' }
 * result:  "perfume"
 *
 * If the value is missing or doesn't match a clause, falls back to `other`
 * (or the first clause when there's no `other`).
 */
const replaceSelectVariable = (message: string, values: IntlMessageValues | undefined, variable: string): string => {
  const variableValues = getVariableValues(variable)
  const valueKeyMatch = variable.match(/(?!{)\w+/)

  if (!valueKeyMatch) {
    return message
  }

  const valueKey = valueKeyMatch[0]
  let variableKey = values ? (values[valueKey] as string | null | undefined) : null

  if (!variableKey || !variableValues[variableKey]) {
    variableKey = 'other' in variableValues ? 'other' : Object.keys(variableValues)[0]
  }

  return message.replace(variable, variableValues[variableKey] ?? '')
}

const replaceSelectVariables = (
  message: string,
  values: IntlMessageValues | undefined,
  onError?: IntlErrorHandler
): string => {
  const variables = message.match(variableRegex)
  if (!variables?.length) {
    return message
  }

  try {
    return variables.reduce((acc, variable) => replaceSelectVariable(acc, values, variable), message)
  }
  catch (err) {
    onError?.(`replaceSelectVariables failed: ${(err as Error).message}`)
    return message
  }
}

export default replaceSelectVariables
