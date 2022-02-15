// CLDR - https://www.unicode.org/cldr/charts/34/supplemental/language_plural_rules.html

const plural = {
  en: (n: number, ord: boolean = false) => {
    const s = String(n).split('.')
    const v0 = !s[1]
    const t0 = Number(s[0]) === n
    const n10 = t0 && Number(s[0].slice(-1))
    const n100 = t0 && Number(s[0].slice(-2))

    if (n === 0) {
      return 'zero'
    }

    if (ord) {
      if (n10 === 1 && n100 !== 11) {
        return 'one'
      }
      if (n10 === 2 && n100 !== 12) {
        return 'two'
      }
      if (n10 === 3 && n100 !== 13) {
        return 'few'
      }

      return 'other'
    }

    if (n === 1 && v0) {
      return 'one'
    }

    if (n === 2 && v0) {
      return 'two'
    }

    return 'other'
  },
}


export default plural
