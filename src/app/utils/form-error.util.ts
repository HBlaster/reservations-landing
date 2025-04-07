import { FormGroup } from '@angular/forms';

export function generateFormErrors(form: FormGroup): string {
  let errorsHtml = '<ul>';
  Object.keys(form.controls).forEach((controlName) => {
    const control = form.get(controlName);
    if (control?.invalid && control.errors) {
      Object.keys(control.errors).forEach((errorKey) => {
        let message = '';
        switch (errorKey) {
          case 'required':
            message = 'is required';
            break;
          case 'email':
            message = 'must be a valid email';
            break;
          case 'minlength':
            message = `must be at least ${
              control.errors![errorKey].requiredLength
            } characters long`;
            break;
          default:
            message = `has error: ${errorKey}`;
        }
        errorsHtml += `<li><strong>${controlName}</strong>: ${message}</li>`;
      });
    }
  });
  errorsHtml += '</ul>';
  return errorsHtml;
}
