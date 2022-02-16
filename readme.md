# Intl

This is lightweight copycat of `react-inlt` package with minimal functionality we need in Scentbird.

## note

For now we have only EN locale and there is no requirements to extract translations to json. All translations 
injected to js bundle.


## Installation

```jsx harmony
import React from 'react'
import { IntlProvider, Message } from 'intl'

const messages = {
  title: {
    en: 'Scentbird',
  },
}

const App = () => (
  <IntlProvider locale="en">
    <Message value={messages.title} />
  </IntlProvider>
)
```

## Message Declaration

All intl messages should be written separately from components in `messages.ts`.

```javascript
const messages = {
  title: {
    en: 'Scentbird',
  },
  content: {
    en: 'Hello, <b>{username}</b>',
  },
}
```

### `<Message />`

```jsx harmony
import { Message } from 'intl'
import messages from './messages'

const App = () => {
  const username = 'John Doe'

  const contentMessage = useMemo(() => ({
    ...messages.content, 
    values: { username },
  }), [])

  return (
    <div>
      <Message value={messages.title} />
      <Message value={contentMessage} />
    </div>
  )
}
```

**Component Props**

`value` - string | IntlMessage<br />
`html` - boolean, "false" by default

`<Message />` is ended component and like tags can receive any additional attribute.

```jsx harmony
<Message value={message} html />
```

### `intl.formatMessage`

We shouldn't wrap `intl.formatMessage` with `useMemo` because its value based on locale. 
Intl makes optimizations inside itself. 

```jsx harmony
import { useIntl } from 'intl'
import messages from './messages'

const App = () => {
  const intl = useIntl()

  const title = intl.formatMessage(messages.title)
  const content = intl.formatMessage(messages.content)

  return (
    <div>
      {title}
      <span dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}
```

:::warning

Please use `<Message />` when it's possible, and avoid of using `intl.formatMessage` when it's not necessary. 

::: 


## Message Syntax

### Simple Arguments

```javascript
'Hello, <b>{username}</b>'

formatMessage(message, { username: 'John Doe' })  // Hello, <b>John Doe</b>
```

### Formatted Arguments

Sometimes you'd like to use conditions inside text based on passed value. The most case is plurals. 
There are couple of formulas:

```javascript
'{count} {count, plural, one {product} other {products}}'

formatMessage(message, { count: 0 })  // 0 products
formatMessage(message, { count: 1 })  // 1 product
```

```javascript
'{count, plural, one {# product} other {# products}}'

formatMessage(message, { count: 0 })  // 0 products
formatMessage(message, { count: 1 })  // 1 product
```

```javascript
'Get free {gender, select, female {perfume} male {cologne}}'

formatMessage(message, { gender: 'female' })  // Get free perfume
formatMessage(message, { gender: 'male' })    // Get free cologne
formatMessage(message, { gender: null })      // Get free
```

```javascript
'{gender, select, female {perfume} male {cologne} other {fragrance}}'

formatMessage(message, { gender: 'female' })  // perfume
formatMessage(message, { gender: 'male' })    // cologne
formatMessage(message, { gender: null })      // fragrance
```

### React Component Arguments

A message can contain react components. To render them as components but not strings `<Message />` component should be used

```jsx harmony
import Icon from 'components/Icon/Icon'
import Link from 'components/Link/Link'

const message = { 
  en: 'Read our <Icon /> <Link to="{docsLink}">docs</Link>',
  values: { docsLink: '/docs' },
  components: { Icon, Link },
}

return (
  <Message value={message} />
)
```
