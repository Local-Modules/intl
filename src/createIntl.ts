import formatMessage from './formatMessage'


type CreateIntlResult = {
  formatMessage: (message: Intl.MessageTranslation, values?: Intl.MessageValues) => string
  setLocale: (locale: string) => void
}

// @ts-ignore
const createIntl = ({ locale, setLocale, onError }): CreateIntlResult => ({
  formatMessage: formatMessage.bind(null, locale),
  setLocale,
})


export default createIntl
