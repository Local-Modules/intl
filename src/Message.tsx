import React, { Fragment } from 'react'

import useIntl from './useIntl'
import replaceReactComponents from './utils/replaceReactComponents'


type MessageProps = {
  className?: string
  value: string | Intl.Message
  tag?: string
  html?: boolean
  onClick?: React.MouseEventHandler<HTMLElement>
}

const Message: React.FunctionComponent<MessageProps> = (props) => {
  const { className, value, tag = 'span', html, onClick } = props

  const intl = useIntl()

  if (!value) {
    // TODO handle error - added on 10/13/20 by pavelivanov
    return null
  }

  if (typeof value === 'string') {
    if (html) {
      return React.createElement(tag, {
        className,
        dangerouslySetInnerHTML: { __html: value },
        onClick,
      })
    }

    // TODO handle error - added on 10/13/20 by pavelivanov
    return React.createElement(tag, { className, onClick }, value)
  }

  const { values, components, ...message } = value

  const formattedMessage: string = intl.formatMessage(message, values)

  if (components) {
    const formattedMessageArr: any[] = replaceReactComponents(formattedMessage, components)

    const children = formattedMessageArr.filter((messageItem) => messageItem).map((messageItem, index) => {
      if (typeof messageItem === 'object') {
        return <Fragment key={index}>{messageItem}</Fragment>
      }

      return <span key={index} dangerouslySetInnerHTML={{ __html: messageItem }} />
    })

    return React.createElement(tag, { className, onClick }, children)
  }

  if (html) {
    return React.createElement(tag, {
      className,
      dangerouslySetInnerHTML: { __html: formattedMessage },
      onClick,
    })
  }

  return React.createElement(tag, { className, onClick }, formattedMessage)
}


export default Message
