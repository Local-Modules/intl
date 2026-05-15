import { describe, it, expect, vi } from 'vitest'

import formatMessage, { MISSED_TRANSLATION } from './formatMessage'

describe('formatMessage', () => {
  it('returns string messages as-is', () => {
    expect(formatMessage('en', 'Hello')).toBe('Hello')
  })

  it('picks the translation for the given locale', () => {
    expect(formatMessage('en', { en: 'Hello', es: 'Hola' })).toBe('Hello')
    expect(formatMessage('es', { en: 'Hello', es: 'Hola' })).toBe('Hola')
  })

  it('substitutes simple variables', () => {
    expect(formatMessage('en', { en: 'Hi, {name}' }, { name: 'Sky' })).toBe('Hi, Sky')
  })

  it('resolves select clauses', () => {
    const msg = { en: '{sex, select, female {perfume} male {cologne} other {fragrance}}' }
    expect(formatMessage('en', msg, { sex: 'female' })).toBe('perfume')
    expect(formatMessage('en', msg, { sex: 'male' })).toBe('cologne')
    expect(formatMessage('en', msg, { sex: null })).toBe('fragrance')
  })

  it('resolves plural clauses with # substitution', () => {
    const msg = { en: '{count, plural, one {# product} other {# products}}' }
    expect(formatMessage('en', msg, { count: 1 })).toBe('1 product')
    expect(formatMessage('en', msg, { count: 23 })).toBe('23 products')
  })

  it('resolves plural with separate count placeholder', () => {
    const msg = { en: '{count} {count, plural, one {product} other {products}}' }
    expect(formatMessage('en', msg, { count: 1 })).toBe('1 product')
    expect(formatMessage('en', msg, { count: 5 })).toBe('5 products')
  })

  it('falls back to other (or first) clause when value is missing', () => {
    const msg = { en: '{count, plural, one {# product} other {# products}}' }
    expect(formatMessage('en', msg)).toBe('products')
  })

  it('returns MISSED_TRANSLATION when message is null/empty', () => {
    expect(formatMessage('en', null)).toBe(MISSED_TRANSLATION)
    expect(formatMessage('en', undefined)).toBe(MISSED_TRANSLATION)
  })

  it('returns MISSED_TRANSLATION when locale translation is missing', () => {
    expect(formatMessage('fr', { en: 'Hello' })).toBe(MISSED_TRANSLATION)
  })

  it('invokes onError for missing translations', () => {
    const onError = vi.fn()
    formatMessage('fr', { en: 'Hello' }, undefined, onError)
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('fr'))
  })

  it('falls back to defaultLocale when active locale has no translation', () => {
    expect(formatMessage('fr', { en: 'Hello' }, undefined, undefined, 'en')).toBe('Hello')
  })

  it('does not invoke onError when defaultLocale fallback resolves', () => {
    const onError = vi.fn()
    formatMessage('fr', { en: 'Hello' }, undefined, onError, 'en')
    expect(onError).not.toHaveBeenCalled()
  })

  it('prefers active locale over defaultLocale when both are present', () => {
    expect(formatMessage('es', { en: 'Hello', es: 'Hola' }, undefined, undefined, 'en')).toBe('Hola')
  })

  it('uses fallback locale for plural rules after defaultLocale fallback', () => {
    const msg = { en: '{count, plural, one {# product} other {# products}}' }
    expect(formatMessage('fr', msg, { count: 5 }, undefined, 'en')).toBe('5 products')
    expect(formatMessage('fr', msg, { count: 1 }, undefined, 'en')).toBe('1 product')
  })

  it('returns MISSED_TRANSLATION when neither locale nor defaultLocale resolves', () => {
    const onError = vi.fn()
    expect(formatMessage('fr', { en: 'Hello' }, undefined, onError, 'de')).toBe(MISSED_TRANSLATION)
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('fr'))
  })

  it('handles a value containing $1-like sequences (Safari 11 regression)', () => {
    expect(formatMessage('en', { en: '{value}' }, { value: '$14.95' })).toBe('$14.95')
  })
})
