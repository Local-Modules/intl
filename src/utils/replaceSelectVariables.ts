import getVariableValues from './getVariableValues'


type Message = string
type Values = { [key: string]: any }

const variableRegex = /{\w+, select,(\s\w+ {[^}]+}){2,}}/g

/**
 * Replace variables with value based on passed values
 *
 * message: "{sex, select, female {perfume} male {cologne} unisex {fragrance}}"
 * values: { sex: 'female' }
 *
 * result: perfume
 */
const replaceSelectVariable = (message: Message, values: Values, variable): string => {
  const variableValues = getVariableValues(variable)
  const valueKey = variable.match(/(?!{)\w+/)[0] // sex
  let variableKey = values ? values[valueKey] : null // female

  // if value not passed set value from the variable (first item) - unisex
  if (!variableKey || !variableValues[variableKey]) {
    // TODO trigger error - added on 10/12/20 by pavelivanov
    variableKey = 'other' in variableValues ? 'other' : Object.keys(variableValues)[0] // eslint-disable-line
  }

  const result = variableValues[variableKey] // perfume

  return message.replace(variable, result)
}

const replaceSelectVariables = (message: Message, values: Values): string => {
  const variables = message.match(variableRegex) // [ '{sex, select, female {perfume} male {cologne} unisex {fragrance}}' ]

  if (variables?.length) {
    try {
      variables.forEach((variable) => {
        message = replaceSelectVariable(message, values, variable)
      })
    }
    catch (err) {
      console.error(err)
    }
  }

  return message
}


export default replaceSelectVariables
