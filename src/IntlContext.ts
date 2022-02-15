import React from 'react'

import createIntl from './createIntl'


const Context = React.createContext<ReturnType<typeof createIntl>>(null)


export default Context
