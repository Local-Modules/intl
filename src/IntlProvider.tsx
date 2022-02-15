import React, { useState, useMemo } from 'react'

import IntlContext from './IntlContext'
import createIntl from './createIntl'


type IntlProviderProps = {
  locale: string
  onError?: (error: string) => void
}

const IntlProvider: React.FunctionComponent<IntlProviderProps> = (props) => {
  const { children, locale: initialLocale, onError } = props

  const [ locale, setLocale ] = useState(initialLocale)

  const intl = useMemo(() => createIntl({ locale, setLocale, onError }), [ locale ])

  return (
    <IntlContext.Provider value={intl}>
      {children}
    </IntlContext.Provider>
  )
}


export default IntlProvider
