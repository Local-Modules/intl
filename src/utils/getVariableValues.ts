/**
 * Parse the inner clauses of a select/plural variable.
 *
 * Input:  "{sex, select, female {perfume} male {cologne} unisex {fragrance}}"
 * Output: { female: 'perfume', male: 'cologne', unisex: 'fragrance' }
 */
const getVariableValues = (variable: string): Record<string, string> => {
  const clauses = variable.match(/\S+ {[^}]*}/g)

  if (!clauses) {
    return {}
  }

  return clauses.reduce<Record<string, string>>((obj, item) => {
    const match = item.match(/(.+) {(.*)}/)
    if (!match) {
      return obj
    }

    const [ , key, value ] = match
    obj[key] = value
    return obj
  }, {})
}

export default getVariableValues
