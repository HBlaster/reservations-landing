import { FormGroup } from "@angular/forms";

export function generarErroresFormulario(form: FormGroup): string {
    let erroresHtml = '<ul>';
    Object.keys(form.controls).forEach((controlName) => {
      const control = form.get(controlName);
      if (control?.invalid && control.errors) {
        Object.keys(control.errors).forEach((errorKey) => {
          let mensaje = '';
          switch (errorKey) {
            case 'required': mensaje = 'es obligatorio'; break;
            case 'email': mensaje = 'debe ser un correo válido'; break;
            case 'minlength':
              mensaje = `debe tener al menos ${control.errors![errorKey].requiredLength} caracteres`;
              break;
            default: mensaje = `tiene error: ${errorKey}`;
          }
          erroresHtml += `<li><strong>${controlName}</strong>: ${mensaje}</li>`;
        });
      }
    });
    erroresHtml += '</ul>';
    return erroresHtml;
  }
  