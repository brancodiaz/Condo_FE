import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const errors: ValidationErrors = {};

    if (value.length < 8) errors['minLength'] = true;
    if (!/[a-z]/.test(value)) errors['lowercase'] = true;
    if (!/[A-Z]/.test(value)) errors['uppercase'] = true;
    if (!/\d/.test(value)) errors['digit'] = true;
    if (!/[^\da-zA-Z]/.test(value)) errors['special'] = true;

    return Object.keys(errors).length ? { strongPassword: errors } : null;
  };
}

export function passwordMatchValidator(
  passwordField: string,
  confirmField: string,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordField);
    const confirm = control.get(confirmField);

    if (!password || !confirm || !confirm.value) return null;

    if (password.value !== confirm.value) {
      confirm.setErrors({ ...confirm.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirm.errors) {
      const { passwordMismatch, ...rest } = confirm.errors;
      confirm.setErrors(Object.keys(rest).length ? rest : null);
    }

    return null;
  };
}
