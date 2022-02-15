declare namespace Intl {

  type MessageValues = {
    [key: string]: any
  }

  type MessageComponents = {
    [key: string]: any
  }

  type MessageTranslation = {
    en: string
    es?: string
  }

  type Message = MessageTranslation & {
    values?: MessageValues
    components?: MessageComponents
  }

  type Components = {
    [key: string]: any
  }
}
