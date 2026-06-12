import { createElement, Fragment, isValidElement, type ComponentType, type ReactElement, type ReactNode } from 'react'
import parse, { domToReact, type DOMNode, type HTMLReactParserOptions } from 'html-react-parser'

import type { IntlErrorHandler, IntlMessageComponents, IntlMessageValues } from '../types'

const interpolateString = (text: string, values?: IntlMessageValues): ReactNode => {
  if (!values || text.indexOf('{') === -1) {
    return text
  }

  const re = /\{(\w+)\}/g
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const value = values[match[1]]
    if (value === undefined || value === null) {
      parts.push(match[0])
    }
    else {
      parts.push(isValidElement(value) ? value : String(value))
    }
    lastIndex = re.lastIndex
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  if (parts.length === 0) return text
  if (parts.length === 1) return parts[0]

  return createElement(Fragment, null, ...parts)
}

const interpolateAttribute = (raw: string, values?: IntlMessageValues): string => {
  if (!values || raw.indexOf('{') === -1) {
    return raw
  }
  return raw.replace(/\{(\w+)\}/g, (full, key: string) => {
    const value = values[key]
    return value === undefined || value === null ? full : String(value)
  })
}

const attribsToProps = (
  attribs: Record<string, string>,
  values?: IntlMessageValues
): Record<string, unknown> => {
  const props: Record<string, unknown> = {}
  for (const key of Object.keys(attribs)) {
    const raw = attribs[key]
    if (raw === '') {
      props[key] = true
    }
    else if (raw === 'true') {
      props[key] = true
    }
    else if (raw === 'false') {
      props[key] = false
    }
    else {
      props[key] = interpolateAttribute(raw, values)
    }
  }
  return props
}

type TagNode = {
  type: 'tag' | 'script' | 'style'
  name: string
  attribs: Record<string, string>
  children?: DOMNode[]
}

type TextNode = {
  type: 'text'
  data: string
}

/**
 * Parse a message template into a React tree.
 *
 * The template is HTML-parsed first, so author-written markup becomes proper
 * React elements (a single `<b>` wraps its children rather than being split
 * across sibling spans). `{key}` placeholders are then interpolated as React
 * text children — they never flow through the HTML parser, so user-supplied
 * `values` can't inject markup.
 *
 * Component tags (`<Link>`, `<Icon />`) are matched case-insensitively against
 * the `components` map and substituted via `createElement`. Self-closing tags
 * without whitespace (`<Icon/>`) are supported.
 */
const parseMessage = (
  template: string,
  values?: IntlMessageValues,
  components?: IntlMessageComponents,
  onError?: IntlErrorHandler
): ReactNode => {
  const componentLookup: Record<string, IntlMessageComponents[string]> = {}

  if (components) {
    for (const key of Object.keys(components)) {
      componentLookup[key.toLowerCase()] = components[key]
    }
  }

  // The browser's native HTML5 parser ignores '/>' for non-void elements —
  // '<Foo />' is treated as an open tag that swallows all subsequent siblings as
  // its children. Expand each known self-closing component tag to an explicit
  // open/close pair so both the server (htmlparser2) and browser parsers see a
  // properly-closed element.
  let src = template
  if (components) {
    const names = Object.keys(components)
    if (names.length > 0) {
      const escaped = names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      const pattern = new RegExp(`<(${escaped.join('|')})([^>]*?)\\/>`,'gi')
      src = src.replace(pattern, '<$1$2></$1>')
    }
  }

  const options: HTMLReactParserOptions = {
    htmlparser2: {
      recognizeSelfClosing: true,
      lowerCaseTags: false,
      lowerCaseAttributeNames: false,
    },
    replace: (node) => {
      const typed = node as unknown as { type: string }
      if (typed.type === 'text') {
        const text = (node as unknown as TextNode).data
        if (!values || text.indexOf('{') === -1) {
          return undefined
        }

        const interpolated = interpolateString(text, values)
        if (typeof interpolated === 'string' && interpolated === text) {
          return undefined
        }
        // html-react-parser ignores plain-string returns from replace for text
        // nodes; wrap in a Fragment so the override is honored.
        return createElement(Fragment, null, interpolated) as ReactElement
      }

      if (typed.type !== 'tag') {
        return undefined
      }

      const element = node as unknown as TagNode
      const Component = componentLookup[element.name.toLowerCase()]
      if (!Component) {
        if (components && /^[A-Z]/.test(element.name)) {
          onError?.(`Component "${element.name}" used in message but not provided to <Message>`)
        }
        return undefined
      }
      const props = attribsToProps(element.attribs, values)
      const children = element.children && element.children.length > 0
        ? domToReact(element.children, options)
        : undefined
      return createElement(Component as ComponentType<Record<string, unknown>>, props, children)
    },
  }

  return parse(src, options)
}

export default parseMessage
