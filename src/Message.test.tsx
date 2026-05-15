import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import IntlProvider from './IntlProvider'
import Message from './Message'
import type { IntlLocale } from './types'

const renderWithIntl = (ui: React.ReactNode, locale: IntlLocale = 'en') =>
  render(<IntlProvider locale={locale}>{ui}</IntlProvider>)

const Link = ({ to, children }: { to?: string; children?: React.ReactNode }) => <a href={to}>{children}</a>
const Icon = () => <span data-testid="icon" />

describe('<Message />', () => {
  it('renders a plain string value', () => {
    renderWithIntl(<Message value="Hello" />)
    expect(screen.getByText('Hello')).toBeDefined()
  })

  it('renders a translated message', () => {
    renderWithIntl(<Message value={{ en: 'Hi, {name}', values: { name: 'Sky' } }} />)
    expect(screen.getByText('Hi, Sky')).toBeDefined()
  })

  it('renders HTML when html prop is set', () => {
    const { container } = renderWithIntl(<Message value={{ en: '<b>bold</b>' }} html />)
    expect(container.querySelector('b')?.textContent).toBe('bold')
  })

  it('substitutes React component placeholders', () => {
    const { container } = renderWithIntl(
      <Message value={{ en: 'Read the <Link to="/docs">docs</Link>', components: { Link } }} />
    )
    const anchor = container.querySelector('a')
    expect(anchor?.getAttribute('href')).toBe('/docs')
    expect(anchor?.textContent).toBe('docs')
  })

  it('renders self-closing components without whitespace (<Icon/>)', () => {
    renderWithIntl(<Message value={{ en: 'Use <Icon/> token', components: { Icon } }} />)
    expect(screen.getByTestId('icon')).toBeDefined()
  })

  it('renders self-closing components with whitespace (<Icon /> and <Icon  />)', () => {
    const { container } = renderWithIntl(
      <Message value={{ en: 'A <Icon /> B <Icon  /> C', components: { Icon } }} />
    )
    expect(container.querySelectorAll('[data-testid="icon"]')).toHaveLength(2)
  })

  it('keeps HTML and components in one coherent DOM tree', () => {
    const { container } = renderWithIntl(
      <Message value={{ en: '<b>Read <Link to="/docs">docs</Link> now</b>', components: { Link } }} />
    )
    const b = container.querySelector('b')
    expect(b).not.toBeNull()
    expect(b!.querySelector('a')?.getAttribute('href')).toBe('/docs')
    expect(b!.textContent).toBe('Read docs now')
  })

  it('keeps self-closing components inside HTML markup', () => {
    const { container } = renderWithIntl(
      <Message value={{ en: '<b>Use <Icon /> token</b>', components: { Icon } }} />
    )
    const b = container.querySelector('b')
    expect(b).not.toBeNull()
    expect(b!.querySelector('[data-testid="icon"]')).not.toBeNull()
    expect(b!.textContent?.replace(/\s+/g, ' ').trim()).toBe('Use token')
  })

  it('interpolates placeholders inside component attributes', () => {
    const { container } = renderWithIntl(
      <Message value={{
        en: 'Open <Link to="/{path}">page</Link>',
        values: { path: 'docs' },
        components: { Link },
      }} />
    )
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/docs')
  })

  it('treats placeholder values as text — they cannot inject markup', () => {
    const { container } = renderWithIntl(
      <Message
        html
        value={{ en: '<b>{name}</b>', values: { name: '<script>alert(1)</script>' } }}
      />
    )
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('b')?.textContent).toBe('<script>alert(1)</script>')
  })

  it('renders nested component with placeholder in child', () => {
    const { container } = renderWithIntl(
      <Message value={{
        en: '<Link to="/x"><b>{label}</b></Link>',
        values: { label: 'docs' },
        components: { Link },
      }} />
    )
    const anchor = container.querySelector('a')
    expect(anchor?.getAttribute('href')).toBe('/x')
    expect(anchor?.querySelector('b')?.textContent).toBe('docs')
  })

  it('renders null for falsy values', () => {
    const { container } = renderWithIntl(<Message value={null} />)
    expect(container.innerHTML).toBe('')
  })

  it('respects the tag prop', () => {
    const { container } = renderWithIntl(<Message value="title" tag="h1" />)
    expect(container.querySelector('h1')?.textContent).toBe('title')
  })

  it('forwards intrinsic props of the chosen tag', () => {
    const { container } = renderWithIntl(
      <Message tag="a" href="/x" target="_blank" value="link" />
    )
    const anchor = container.querySelector('a')
    expect(anchor?.getAttribute('href')).toBe('/x')
    expect(anchor?.getAttribute('target')).toBe('_blank')
  })

  it('forwards data-* and aria-* attributes', () => {
    const onClick = vi.fn()
    const { container } = renderWithIntl(
      <Message
        value="x"
        className="hi"
        data-testid="msg"
        aria-label="greeting"
        onClick={onClick}
      />
    )
    const span = container.querySelector('span')
    expect(span?.getAttribute('class')).toBe('hi')
    expect(span?.getAttribute('data-testid')).toBe('msg')
    expect(span?.getAttribute('aria-label')).toBe('greeting')
  })

  it('forwards onError through IntlProvider', () => {
    const onError = vi.fn()
    render(
      <IntlProvider locale="fr" onError={onError}>
        <Message value={{ en: 'Hello' }} />
      </IntlProvider>
    )
    expect(onError).toHaveBeenCalled()
  })

  it('resolves plural in parsed-tree mode (html + IntlMessage)', () => {
    const msg = {
      en: '{count, plural, one {# <b>item</b>} other {# <b>items</b>}}',
    }
    const a = renderWithIntl(<Message html value={{ ...msg, values: { count: 1 } }} />)
    expect(a.container.textContent?.replace(/\s+/g, ' ').trim()).toBe('1 item')
    expect(a.container.querySelector('b')?.textContent).toBe('item')

    const b = renderWithIntl(<Message html value={{ ...msg, values: { count: 3 } }} />)
    expect(b.container.textContent?.replace(/\s+/g, ' ').trim()).toBe('3 items')
    expect(b.container.querySelector('b')?.textContent).toBe('items')
  })

  it('resolves select clauses in components mode', () => {
    const msg = {
      en: '{kind, select, doc {<Link to="/docs">docs</Link>} other {<Link to="/help">help</Link>}}',
    }
    const { container } = renderWithIntl(
      <Message value={{ ...msg, values: { kind: 'doc' }, components: { Link } }} />
    )
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/docs')
    expect(container.querySelector('a')?.textContent).toBe('docs')
  })

  it('reports onError when a message uses an unknown component', () => {
    const onError = vi.fn()
    render(
      <IntlProvider locale="en" onError={onError}>
        <Message value={{ en: 'Open <Missing>here</Missing>', components: { Link } }} />
      </IntlProvider>
    )
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('Missing'))
  })
})
