import plural from './plural'
import getVariableValues from './getVariableValues'


const variableRegex = /{\w+, plural,(\s\w+ {#?[^#}]+}){2,}}/g

/**
 * Replace variables with value based on passed values
 *
 * message: "{count, plural, one {# product} other {# products}}"
 * values: { count: 23 }
 *
 * result: 23 products
 */
const replacePluralVariables = (message: string, values: { [key: string]: any }, locale: string): string => {
  const variables = message.match(variableRegex) // [ '{count, plural, one {# product} other {# products}}' ]

  if (variables?.length) {
    try {
      variables.forEach((variable) => {
        const variableValues = getVariableValues(variable)
        // @ts-ignore
        const valueKey = variable.match(/[^,{]+/)[0] // count
        const value = values ? values[valueKey] : null // 23

        let variableKey
        let result

        // if value not passed set pluralKey value from the variable (first item) - other
        if (value === null || value === undefined) {
          // TODO trigger error - added on 10/12/20 by pavelivanov
          variableKey = 'other' in variableValues ? 'other' : Object.keys(variableValues)[0] // eslint-disable-line
          result = variableValues[variableKey].replace(/#\s?/g, '') // products
        }
        else {
          // @ts-ignore
          variableKey = plural[locale](value) // other

          if (!variableValues[variableKey]) {
            variableKey = 'other'
          }

          result = variableValues[variableKey].replace(/#/g, value) // 23 products
        }

        message = message.replace(variable, result)
      })
    }
    catch (err) {

    }
  }

  return message
}


export default replacePluralVariables
