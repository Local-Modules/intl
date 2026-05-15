import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

import parseMessage from './parseMessage'

const Link = ({ to, children }: { to?: string; children?: React.ReactNode }) => <a href={to}>{children}</a>
const Icon = () => <span data-testid="icon" />

const renderNode = (node: React.ReactNode) => render(<>{node}</>)

describe('parseMessage', () => {
  it('returns plain text untouched when there are no tags or placeholders', () => {
    const { container } = renderNode(parseMessage('hello'))
    expect(container.textContent).toBe('hello')
  })

  it('parses HTML markup into elements', () => {
    const { container } = renderNode(parseMessage('<b>bold</b>'))
    expect(container.querySelector('b')?.textContent).toBe('bold')
  })

  it('substitutes component tags case-insensitively', () => {
    const { container } = renderNode(parseMessage('Use <Icon /> token', undefined, { Icon }))
    expect(container.querySelector('[data-testid="icon"]')).not.toBeNull()
  })

  it('substitutes component tags with zero-whitespace self-close', () => {
    const { container } = renderNode(parseMessage('Use <Icon/> token', undefined, { Icon }))
    expect(container.querySelector('[data-testid="icon"]')).not.toBeNull()
  })

  it('passes attributes through as component props', () => {
    const { container } = renderNode(
      parseMessage('<Link to="/x">go</Link>', undefined, { Link })
    )
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/x')
  })

  it('interpolates {key} placeholders in text nodes', () => {
    const { container } = renderNode(parseMessage('Hi, {name}', { name: 'Sky' }))
    expect(container.textContent).toBe('Hi, Sky')
  })

  it('interpolates {key} placeholders in attribute values', () => {
    const { container } = renderNode(
      parseMessage('<Link to="/{path}">go</Link>', { path: 'docs' }, { Link })
    )
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/docs')
  })

  it('leaves {key} as text when value is missing', () => {
    const { container } = renderNode(parseMessage('Hi, {name}', {}))
    expect(container.textContent).toBe('Hi, {name}')
  })

  it('handles mixed nesting of HTML and components', () => {
    const { container } = renderNode(
      parseMessage(
        '<b>Read <Link to="/x"><i>{label}</i></Link></b>',
        { label: 'docs' },
        { Link }
      )
    )
    const b = container.querySelector('b')
    const a = b?.querySelector('a')
    const i = a?.querySelector('i')
    expect(a?.getAttribute('href')).toBe('/x')
    expect(i?.textContent).toBe('docs')
  })

  it('does not let placeholder values inject HTML', () => {
    const { container } = renderNode(
      parseMessage('<b>{name}</b>', { name: '<script>alert(1)</script>' })
    )
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('b')?.textContent).toBe('<script>alert(1)</script>')
  })
})
