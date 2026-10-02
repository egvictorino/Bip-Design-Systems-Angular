import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { validateRFC } from './rfc';

/** Validator de Reactive Forms para `validateRFC()`. Campo vacío no es error (usar `Validators.required` aparte). */
export function bipRfcValidator(): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    return validateRFC(value) ? null : { bipRfc: true };
  };
}
