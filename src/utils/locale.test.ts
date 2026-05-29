import { describe, expect, it } from 'vitest';
import { detectPreferredLocale, parseAcceptLanguage, stripLocaleFromPath, withLocale } from './locale';

describe('locale detection', () => {
  it('prefers a supported stored language', () => {
    expect(
      detectPreferredLocale({
        storedLanguage: 'cs',
        languages: ['de-DE'],
        language: 'de-DE',
        acceptLanguage: 'pl-PL, en;q=0.8',
      }),
    ).toBe('cs');
  });

  it('uses navigator languages before navigator language and accept-language', () => {
    expect(
      detectPreferredLocale({
        languages: ['sk-SK', 'pl-PL'],
        language: 'de-DE',
        acceptLanguage: 'cs-CZ, en;q=0.8',
      }),
    ).toBe('pl');
  });

  it('parses accept-language quality values and falls back to en', () => {
    expect(parseAcceptLanguage('fr-FR, de-DE;q=0.9, cs-CZ;q=0.7')).toBe('de');
    expect(detectPreferredLocale({ languages: ['fr-FR'], language: 'it-IT', acceptLanguage: 'es-ES' })).toBe('en');
  });

  it('adds and removes locale prefixes', () => {
    expect(stripLocaleFromPath('/de/research/articles')).toBe('/research/articles');
    expect(withLocale('pl', '/research/articles')).toBe('/pl/research/articles');
    expect(withLocale('en', '/')).toBe('/en/');
  });
});
