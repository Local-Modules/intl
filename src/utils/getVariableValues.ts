type Result = { [key: string]: string }

/**
 * variable: "{sex, select, female {perfume} male {cologne} unisex {fragrance}}"
 *
 * result: { female: 'perfume', male: 'cologne', unisex: 'fragrance' }
 */
const getVariableValues = (variable: string): Result =>
  variable
    .match(/[^\s]+ {[^}]*}/g)
    .reduce((obj, item) => {
      const [ match, key, value ] = item.match(/(.+) {(.*)}/)

      return { ...obj, [key]: value }
    }, {})


export default getVariableValues
