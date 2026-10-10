# @locmod/intl

A lightweight `react-intl` alternative with minimal API. React 19, ESM-only, fully typed.

## Installation

```sh
npm install @locmod/intl
```

To get the legacy global `Intl.Message` / `Intl.MessageTranslation` types, add the following triple-slash reference somewhere in your app (e.g. `next-env.d.ts`):

```ts
/// <reference types="@locmod/intl" />
```

Or import the named types directly:

```ts
import type { IntlMessage, IntlMessageTranslation } from '@locmod/intl'
```

## Declaring locales

`IntlMessage`, `IntlMessageTranslation`, and `IntlLocale` are driven by a consumer-augmentable registry. Without augmentation, only `'en'` is required and no other locale keys are allowed on message objects.

Declare the locales your app uses via module augmentation (e.g. in `intl.d.ts` or any `.d.ts` picked up by your `tsconfig`):

```ts
export {} // required — see note below

declare module '@locmod/intl' {
  interface IntlLocales {
    RequiredLocales: 'en'
    OptionalLocales: 'es' | 'de'
  }
}
```

> **Important:** the file must have at least one top-level `import` or `export` (the `export {}` above is enough). Without it, TypeScript treats `declare module '@locmod/intl' { … }` as an *ambient* module declaration that **replaces** the package's types, and imports like `import { Message } from '@locmod/intl'` start erroring with "has no exported member".

After that:

- `{ en: '…', es: '…' }` typechecks; `{ en: '…', fr: '…' }` errors (`fr` not declared).
- `IntlLocale` resolves to `'en' | 'es' | 'de'` everywhere — `<IntlProvider locale={…}>`, `useIntl().locale`, `setLocale(…)`.
- `RequiredLocales` can be a union if your messages must always provide more than one (e.g. `'en' | 'fr'`).

## Usage

```tsx
import { IntlProvider, Message } from '@locmod/intl'

const messages = {
  title: { en: 'Hello World' },
}

const App = () => (
  <IntlProvider locale="en">
    <Message value={messages.title} />
  </IntlProvider>
)
```

## Message declaration

Define messages in a separate file (e.g. `messages.ts`) — they bundle into JS, no JSON extraction step.

```ts
const messages = {
  title: { en: 'Hello World' },
  content: { en: 'Hello, <b>{username}</b>' },
}
```

### `<Message />`

```tsx
import { Message } from '@locmod/intl'
import messages from './messages'

const App = () => {
  const username = 'John Doe'

  const contentMessage = { ...messages.content, values: { username } }

  return (
    <div>
      <Message value={messages.title} />
      <Message value={contentMessage} />
    </div>
  )
}
```

**Props**

- `value` — `string | IntlMessage | null | undefined`. Falsy values render nothing.
- `html` — `boolean`. When set, the message body is parsed as HTML (and a React tree is built rather than using `dangerouslySetInnerHTML`). Default `false`.
- `tag` — intrinsic tag name to wrap the output in. Default `"span"`.
- Any other prop is forwarded to the wrapper element. The type is inferred from `tag`, so `<Message tag="a" href="/x" target="_blank" />` typechecks.

```tsx
<Message value={message} html />
<Message tag="a" href="/docs" value={messages.docsLink} />
```

### `useIntl()`

`useIntl()` returns the active `intl` object from the nearest `<IntlProvider>`:

```tsx
import { useIntl } from '@locmod/intl'

const LocaleSwitcher = () => {
  const { locale, defaultLocale, setLocale } = useIntl()

  return (
    <select value={locale} onChange={(e) => setLocale(e.target.value)}>
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  )
}
```

- `locale` — current locale.
- `defaultLocale` — fallback locale (or `undefined` if none was configured on the provider).
- `setLocale(locale)` — switch the active locale; re-renders every `useIntl` consumer.
- `formatMessage(message, values?)` — resolve a translation to a string.

### `useIntl().formatMessage`

`formatMessage` is locale-aware and memoized inside the provider, so wrapping its result in `useMemo` isn't needed.

```tsx
import { useIntl } from '@locmod/intl'
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

Prefer `<Message />` when possible; use `formatMessage` only when you need a raw string.

### `defaultLocale`

`IntlProvider` accepts an optional `defaultLocale`. When a message has no translation for the active locale, the provider falls back to the translation under `defaultLocale` instead of returning `MISSED_TRANSLATION`. Plural rules use the resolved locale (the language of the returned text), so a fallback to English picks English plural forms.

```tsx
<IntlProvider locale="fr" defaultLocale="en">
  {/* { en: 'Hello' } renders as "Hello" under the `fr` locale */}
</IntlProvider>
```

`onError` is **not** invoked when the fallback resolves successfully; it only fires when neither locale has a translation.

### `onError`

```tsx
<IntlProvider locale="en" onError={(msg) => console.warn(msg)}>
  …
</IntlProvider>
```

`onError` is called on missing messages, missing translations, missing components, and plural rules missing for a locale the runtime does not know. Unhandled translations resolve to the sentinel `MISSED_TRANSLATION` (`{{ missed_translation }}`).

## Message syntax

### Simple arguments

```ts
'Hello, <b>{username}</b>'

formatMessage(message, { username: 'John Doe' }) // 'Hello, <b>John Doe</b>'
```

### Plurals

```ts
'{count} {count, plural, one {product} other {products}}'

formatMessage(message, { count: 0 }) // '0 products'
formatMessage(message, { count: 1 }) // '1 product'
```

```ts
'{count, plural, one {# product} other {# products}}'

formatMessage(message, { count: 0 }) // '0 products'
formatMessage(message, { count: 1 }) // '1 product'
```

Plural forms follow each locale's CLDR rules. English uses the library's own rules: besides `one` and `other`, a message may give a `zero` branch for 0 and a `two` branch for 2. Every other locale uses the runtime's `Intl.PluralRules`, so its `one`, `few`, `many` and `other` categories match the language:

```ts
'{count, plural, one {# produto} other {# produtos}}'

// pt-BR puts 0 and 1 in `one`
formatMessage(message, { count: 0 }) // '0 produto'
formatMessage(message, { count: 2 }) // '2 produtos'
```

A locale the runtime has no plural data for falls back to the `other` branch and reports it through `onError`.

### Select

```ts
'Get free {gender, select, female {perfume} male {cologne}}'

formatMessage(message, { gender: 'female' }) // 'Get free perfume'
formatMessage(message, { gender: 'male' })   // 'Get free cologne'
formatMessage(message, { gender: null })     // 'Get free '
```

```ts
'{gender, select, female {perfume} male {cologne} other {fragrance}}'

formatMessage(message, { gender: null })     // 'fragrance'
```

### React component arguments

A message can embed React components — `<Message />` parses the formatted template into a React tree and substitutes matching tags via `React.createElement`. Self-closing tags (`<Icon />`, `<Icon/>`) and tags with attributes (`<Link to="/x">…</Link>`) both work. Component-name matching is case-sensitive against the `components` map.

```tsx
import Icon from 'components/Icon/Icon'
import Link from 'components/Link/Link'

const message = {
  en: 'Read our <Icon /> <Link to="{docsLink}">docs</Link>',
  values: { docsLink: '/docs' },
  components: { Icon, Link },
}

return <Message value={message} />
```

HTML markup and components can be mixed in one message — the result is a single coherent DOM tree:

```tsx
const message = {
  en: '<b>Read our <Link to="/docs">docs</Link> now</b>',
  components: { Link },
}
```

Interpolated `values` are safe to use alongside `html` / `components`: they enter the React tree as text children (never through the HTML parser), so user-supplied input cannot inject markup — React's normal text-node escaping applies.

## Migration from 1.x

- **Peer dep is now React 19.** Drop React 17 / `@types/react` 17.
- **Build is now ESM-only.** No CJS output. Consumers must be able to `import` ESM (Node ≥ 18, modern bundlers, or `"type": "module"` packages).
- **`useIntl` throws when used outside `<IntlProvider>`** instead of returning `null`. Wrap your tree or render guards accordingly.
- **`onError` is now actually wired through** the pipeline (1.x accepted it but never called it).
- **Named types are exported** (`IntlMessage`, `IntlMessageTranslation`, …) alongside the legacy `Intl.Message*` globals. Prefer the named exports in new code.
- **The `Intl` runtime type is exported as `IntlApi`** to avoid colliding with the global `Intl` namespace.
- **Locales are now declared, not freeform.** `IntlLocale` was `string` in 1.x; it now resolves from the `IntlLocales` registry. Without augmentation, only `'en'` is recognized — add a `declare module '@locmod/intl'` block (see [Declaring locales](#declaring-locales)) to register the rest.
