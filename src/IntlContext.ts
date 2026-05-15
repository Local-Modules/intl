import { createContext } from 'react'
import type { IntlInternal } from './types'

const IntlContext = createContext<IntlInternal | null>(null)

export default IntlContext
