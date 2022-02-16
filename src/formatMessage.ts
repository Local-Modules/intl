import replaceSimpleVariables from './utils/replaceSimpleVariables'
import replacePluralVariables from './utils/replacePluralVariables'
import replaceSelectVariables from './utils/replaceSelectVariables'
import stripSpaces from './utils/stripSpaces'
import type { IntlMessageTranslation, IntlMessageValues} from './types'


const formatMessage = (locale: string = 'en', message: IntlMessageTranslation, values?: IntlMessageValues) => {
  if (typeof message === 'string') {
    return message
  }

  // TODO add error handler - added on 10/9/20 by pavelivanov
  if (!message) {
    return '{{ missed_translation }}'
  }

  // @ts-ignore
  let fMessage = stripSpaces(message[locale])

  // @ts-ignore
  fMessage = replaceSelectVariables(fMessage, values)
  // @ts-ignore
  fMessage = replacePluralVariables(fMessage, values, locale)
  fMessage = replaceSimpleVariables(fMessage, values)

  return fMessage || '{{ missed_translation }}'
}


export default formatMessage
