// Augments the IntlLocales registry for the package's own tests.
// Not part of the publish artifact (tsup builds from src/index.ts only).

import './types'

declare module './types' {
  interface IntlLocales {
    RequiredLocales: 'en'
    OptionalLocales: 'es' | 'fr' | 'de'
  }
}
