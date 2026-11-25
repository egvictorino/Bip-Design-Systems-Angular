import { describe, expect, it } from 'vitest';
import { foldSearchText, matchesSearch } from './search';

describe('foldSearchText', () => {
  it('quita acentos y pasa a minúsculas', () => {
    expect(foldSearchText('México')).toBe('mexico');
    expect(foldSearchText('CANADÁ')).toBe('canada');
  });

  it('trata la ñ como n (descompone la tilde combinante)', () => {
    expect(foldSearchText('Año')).toBe('ano');
  });
});

describe('matchesSearch', () => {
  const option = { value: 'mx', label: 'México' };

  it('query vacía o con espacios coincide con todo', () => {
    expect(matchesSearch(option, '')).toBe(true);
    expect(matchesSearch(option, '   ')).toBe(true);
  });

  it('ignora mayúsculas y acentos', () => {
    expect(matchesSearch(option, 'mexi')).toBe(true);
    expect(matchesSearch(option, 'MÉXI')).toBe(true);
  });

  it('coincide por value', () => {
    expect(matchesSearch(option, 'mx')).toBe(true);
  });

  it('no coincide con texto ajeno', () => {
    expect(matchesSearch(option, 'canada')).toBe(false);
  });
});
