/**
 * Replace pure {value} variables
 *
 * message: "Price - ${value}"
 * values: { value: 100 }
 *
 * result: Price - $100
 */
const replaceSimpleVariables = (message, values = {}) =>
  // there is no way to math variables first and then iterate by them, coz if we try to find {variable} we match
  // variables in variables - {sex, select, female {perfume} male {cologne} unisex {fragrance}}
  Object.keys(values).reduce((res, key) => {
    const value = values[key]

    if (value === null || value === undefined) {
      return res
    }

    // prevent of replacing value in variables (that matching the variable name)
    // example message - 'Some {key} with {check, plural, one {key} other {something}}'
    // const escapeFormulasRegexp = `{${key}}(?!([^{]+)?(({[^{}]+}([^{}]+)?)+)?})`
    //
    // here the ductape "() => values[key]" to fix Safari 11.* bug - '{value}'.replace(/{value}/g, '$14.95') becomes '4.95'
    return res.replace(new RegExp(`{${key}}`, 'g'), () => value)
  }, message)


export default replaceSimpleVariables
