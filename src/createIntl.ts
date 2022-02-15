import formatMessage from './formatMessage'


type CreateIntlResult = {
  formatMessage: (message: string | Intl.MessageTranslation, values?: Intl.MessageValues) => string
  setLocale: (locale: string) => void
}

const createIntl = ({ locale, setLocale, onError }): CreateIntlResult => ({
  formatMessage: formatMessage.bind(null, locale),
  setLocale,
})


export default createIntl
