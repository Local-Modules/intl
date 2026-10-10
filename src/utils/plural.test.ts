import { describe, it, expect } from 'vitest'

import { getPluralCategory } from './plural'

describe('getPluralCategory', () => {
  it('keeps the built-in English rules', () => {
    expect(getPluralCategory('en', 0)).toBe('zero')
    expect(getPluralCategory('en', 1)).toBe('one')
    expect(getPluralCategory('en', 2)).toBe('two')
    expect(getPluralCategory('en', 5)).toBe('other')
    expect(getPluralCategory('en', 1.5)).toBe('other')
  })

  it('uses CLDR rules for locales without built-in rules', () => {
    // Brazilian Portuguese puts 0 and 1 in `one`; European Portuguese only 1.
    expect(getPluralCategory('pt-BR', 0)).toBe('one')
    expect(getPluralCategory('pt-BR', 1)).toBe('one')
    expect(getPluralCategory('pt-BR', 2)).toBe('other')
    expect(getPluralCategory('pt-PT', 0)).toBe('other')
    expect(getPluralCategory('pt-PT', 1)).toBe('one')
    expect(getPluralCategory('es', 1)).toBe('one')
    expect(getPluralCategory('es', 3)).toBe('other')
  })

  it('returns the few and many categories where the locale has them', () => {
    expect(getPluralCategory('ru', 1)).toBe('one')
    expect(getPluralCategory('ru', 3)).toBe('few')
    expect(getPluralCategory('ru', 5)).toBe('many')
    expect(getPluralCategory('ru', 21)).toBe('one')
  })

  it('returns null for a locale the runtime has no rules for', () => {
    expect(getPluralCategory('xx', 1)).toBeNull()
    expect(getPluralCategory('not a locale', 1)).toBeNull()
  })
})
