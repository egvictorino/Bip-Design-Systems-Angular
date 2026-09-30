import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { bipRfcValidator } from './bip-rfc.validator';

describe('bipRfcValidator()', () => {
  it('no marca error en un campo vacío', () => {
    const control = new FormControl('', { validators: bipRfcValidator() });
    expect(control.errors).toBeNull();
  });

  it('no marca error con un RFC válido', () => {
    const control = new FormControl('ABC800101AA1', { validators: bipRfcValidator() });
    expect(control.errors).toBeNull();
  });

  it('marca { bipRfc: true } con un RFC inválido', () => {
    const control = new FormControl('INVALIDO', { validators: bipRfcValidator() });
    expect(control.errors).toEqual({ bipRfc: true });
  });
});
