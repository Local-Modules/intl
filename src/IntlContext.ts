import React from 'react'

import createIntl from './createIntl'

// @ts-ignore
const Context = React.createContext<ReturnType<typeof createIntl>>(null)


export default Context
