export type IntlMessageValues = {
  [key: string]: any
}

export type IntlMessageComponents = {
  [key: string]: any
}

export type IntlMessageTranslation = {
  en: string
  es?: string
}

export type IntlMessage = IntlMessageTranslation & {
  values?: IntlMessageValues
  components?: IntlMessageComponents
}

export type IntlComponents = {
  [key: string]: any
}

