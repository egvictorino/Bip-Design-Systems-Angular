import { describe, expect, it } from 'vitest';
import { validateRFC } from './rfc';

describe('validateRFC', () => {
  describe('valid RFCs', () => {
    it('accepts a valid RFC for persona moral (3 letters)', () => {
      expect(validateRFC('ABC800101AA1')).toBe(true);
    });

    it('accepts a valid RFC for persona física (4 letters)', () => {
      expect(validateRFC('GOVE800101AA1')).toBe(true);
    });

    it('accepts RFC with Ñ in name part', () => {
      expect(validateRFC('GOÑE800101AA1')).toBe(true);
    });

    it('accepts RFC with & in name part', () => {
      expect(validateRFC('GO&E800101AA1')).toBe(true);
    });

    it('accepts RFC with digits in homoclave', () => {
      expect(validateRFC('ABC8001011A2')).toBe(true);
    });
  });

  describe('invalid RFCs', () => {
    it('rejects an empty string', () => {
      expect(validateRFC('')).toBe(false);
    });

    it('rejects lowercase letters', () => {
      expect(validateRFC('abc800101AA1')).toBe(false);
    });

    it('rejects RFC that is too short', () => {
      expect(validateRFC('ABC8001')).toBe(false);
    });

    it('rejects RFC that is too long', () => {
      expect(validateRFC('ABCDE800101AA1')).toBe(false);
    });

    it('rejects RFC with letters in the date segment', () => {
      expect(validateRFC('ABCX00101AA1')).toBe(false);
    });

    it('rejects RFC with special characters in homoclave', () => {
      expect(validateRFC('ABC800101@A1')).toBe(false);
    });

    it('rejects a completely invalid string', () => {
      expect(validateRFC('INVALIDO')).toBe(false);
    });
  });
});
