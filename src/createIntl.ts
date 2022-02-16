import formatMessage from './formatMessage'
import { IntlMessageTranslation, IntlMessageValues } from './types'


type CreateIntlResult = {
  formatMessage: (message: IntlMessageTranslation, values?: IntlMessageValues) => string
  setLocale: (locale: string) => void
}

// @ts-ignore
const createIntl = ({ locale, setLocale, onError }): CreateIntlResult => ({
  formatMessage: formatMessage.bind(null, locale),
  setLocale,
})


export default createIntl
