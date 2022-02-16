import React from 'react'
import { IntlComponents } from '../types'


// <Button boolAttr1 valueAttr1="/queue" valueAttr2=" value " emptyAttr="" boolAttr2>content</Button>
export const getComponentProps = (message: string): { [key: string]: any } => {
  const props = {}

  if (/<\w+\s*\/>/.test(message)) {
    // @ts-ignore
    return
  }

  const attrsPart = message
    .replace(/^<\w+\s+([^>]+?)\/?>.*/, '$1') // leave only part with attributes - 'boolAttr1 valueAttr1="/queue" valueAttr2=" value " emptyAttr="" boolAttr2'
    .replace(/\s*=\s*/g, '=') // strip spaces around `=`

  // to match all empty attributes with regex too complex, so
  const emptyProps = (
    attrsPart
      .replace(/\w+\s*=\s*["'].*?["']/g, '') // strip attributes with values - 'boolAttr1    boolAttr2'
      .trim()
      .split(/\s+/g) // split empty attributes - [ 'boolAttr1', 'boolAttr2' ]
  )

  emptyProps.forEach((prop) => {
    if (prop) {
      // @ts-ignore
      props[prop] = true
    }
  })

  const valuedProps = attrsPart.trim().match(/\w+\s*=\s*['"][^"]*?['"]/g) // [ 'valueAttr1="/queue"', 'valueAttr2=" value "', 'emptyAttr=""' ]

  // @ts-ignore
  valuedProps.forEach((match) => {
    let [ key, value ] = match.trim().split('=') as [ any, any ]

    if (value) {
      value = value.replace(/['"]/g, '')
    }

    if (value === 'true') {
      value = true
    }
    else if (value === 'false') {
      value = false
    }

    // @ts-ignore
    props[key] = value
  })

  return props
}

export const getComponentChildren = (message: string): string => {
  // @ts-ignore
  const componentName = message.match(/<(\w+)/)[1]

  // <Icon />
  if (/^<[^>]+\/>$/.test(message)) {
    // @ts-ignore
    return undefined
  }

  // <Link to="/">bar</Link>
  // complex regex to be sure that value be matched properly even if the content is "< apple>banana<grape>"
  // @ts-ignore
  return message.match(new RegExp(`<\\s*${componentName}[^>]+?>(.*)<\/\\s*${componentName}\\s*>`))[1]
}

export const createComponent = (message: string, components: any): React.ReactElement => {
  try {
    // @ts-ignore
    const componentName = message.match(/<(\w+)/)[1]
    const component = components[componentName]
    const props = getComponentProps(message)
    const children = getComponentChildren(message)

    return React.createElement(component, props, children)
  }
  catch (err) {
    console.error(err)
    // TODO add error handling - added on 10/12/20 by pavelivanov
    // @ts-ignore
    return null
  }
}

/**
 * Replace components in string message with components create with React.createElement
 *
 * message: "foo <Link to="/">bar</Link> zoo <Icon /> baz <Button>kek</Button>"
 * components: { Link: Link, Icon: Icon, Button: Button }
 *
 * result:
 *
 * [
 *   "foo ",
 *   React.createElement(Link, { to: '/' }, 'bar'),
 *   " zoo ",
 *   React.createElement(Icon),
 *   " baz ",
 *   "<Href>kek</Href>",
 * ]
 */
const replaceReactComponents = (message: string, components: IntlComponents): any[] => {
  const componentNames = Object.keys(components || {})

  if (!componentNames.length) {
    return [ message ]
  }

  const compoRegexStr = componentNames.join('|') // Link|Icon|Button
  const splitRegex = new RegExp(`(<\\s*(?:${compoRegexStr})(?:[^>]+?\/>|.+?(?:${compoRegexStr}\\s*)>))`, 'g')

  let messageArr = message.split(splitRegex)

  return (
    messageArr
      .map((message) => {
        // check that this message part contains a component
        if (new RegExp(`<${compoRegexStr}`).test(message)) {
          return createComponent(message, components)
        }

        return message
      })
      .filter((v) => v)
  )
}


export default replaceReactComponents
