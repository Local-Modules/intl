import React, { createElement, useContext } from 'react'

import IntlContext from './IntlContext'
import parseMessage from './utils/parseMessage'
import type { IntlMessage, IntlMessageTranslation } from './types'

type IntrinsicTag = keyof React.JSX.IntrinsicElements

type MessageOwnProps = {
  /** Translation object or plain string. `null`/`undefined` renders nothing. */
  value: string | IntlMessage | null | undefined
  /** When `true`, the message body is parsed as HTML (and forms a React tree alongside any `components`). */
  html?: boolean
}

type MessageProps<T extends IntrinsicTag = 'span'> =
  MessageOwnProps
  & {tag?: T }
  & Omit<React.ComponentPropsWithRef<T>, keyof MessageOwnProps | 'tag' | 'children' | 'dangerouslySetInnerHTML'>

/**
 * Render an `IntlMessage` (or plain string) under the current `IntlProvider`.
 *
 * Rendering modes:
 * - **Text** (default): output as plain text inside `tag` (a `<span>` by default).
 * - **Parsed** (when `html` is set or the message defines `components`): the formatted
 *   template is parsed into a React tree, so HTML markup and component placeholders
 *   compose into a single coherent DOM. Interpolated `values` enter the tree as React
 *   text children, so user-supplied input cannot inject markup.
 *
 * Any prop other than `value`, `tag`, and `html` is forwarded to the wrapper
 * element (e.g. `href` when `tag="a"`, `id`, `data-testid`, `aria-*`).
 *
 * @example
 * ```tsx
 * <Message value={messages.title} />
 * <Message value={{ ...messages.greeting, values: { name } }} />
 * <Message tag="a" href="/docs" value={messages.docsLink} />
 * <Message value={{ ...messages.help, components: { Link } }} />
 * ```
 */
const Message = <T extends IntrinsicTag = 'span'>({
  value,
  tag,
  html,
  ...rest
}: MessageProps<T>) => {
  const intl = useContext(IntlContext)

  if (!intl) {
    throw new Error('<Message> must be used within an <IntlProvider>')
  }

  if (!value) {
    return null
  }

  const Tag = (tag ?? 'span') as IntrinsicTag

  if (typeof value === 'string') {
    if (html) {
      return createElement(Tag, rest, parseMessage(value))
    }

    return createElement(Tag, rest, value)
  }

  const { values, components, ...translationFields } = value
  // After extracting the non-translation fields, only locale → string entries remain;
  // cast narrows the index signature widened by `IntlMessage`.
  const translations = translationFields as IntlMessageTranslation
  const useParsedTree = html || Boolean(components)

  if (!useParsedTree) {
    return createElement(Tag, rest, intl.formatMessage(translations, values))
  }

  const template = intl.formatTemplate(translations, values)
  const children = parseMessage(template, values, components, intl.onError)

  return createElement(Tag, rest, children)
}

export default Message
