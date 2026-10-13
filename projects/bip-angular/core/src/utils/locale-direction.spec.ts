import { describe, expect, it } from 'vitest';
import { localeDirection } from './locale-direction';

describe('localeDirection', () => {
  it.each(['es-MX', 'en-US', 'ku-Latn', 'zh-CN'])('%s es ltr', (tag) => {
    expect(localeDirection(tag)).toBe('ltr');
  });

  it.each(['ar-EG', 'ar', 'he-IL', 'fa', 'ur-PK', 'az-Arab'])('%s es rtl', (tag) => {
    expect(localeDirection(tag)).toBe('rtl');
  });

  it('cae a ltr con un tag inválido', () => {
    expect(localeDirection('no es un tag')).toBe('ltr');
    expect(localeDirection('')).toBe('ltr');
  });
});
