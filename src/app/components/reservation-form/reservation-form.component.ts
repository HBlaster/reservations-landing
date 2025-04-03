import { Component } from '@angular/core';
import { Router } from '@angular/router'; 
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.css'
})
export class ReservationFormComponent {
  contactoForm: FormGroup;
    
    condiciones: boolean = true;
    constructor(private router: Router,
      private fb: FormBuilder) { 
        this.contactoForm = this.fb.group({
          usuario: ['', Validators.required],
          email: ['', [Validators.required, Validators.email]],
          official_id: ['', Validators.required],
          calendar: ['', Validators.required],
          // condiciones: [false, Validators.requiredTrue] // si decides incluir el checkbox
        });
      }
    ngOnInit() {}
  
    onSubmit(): void {
      if (this.contactoForm.valid) {
        Swal.fire('Éxito', 'Formulario enviado correctamente', 'success');
        console.log(this.contactoForm.value);
      } else {
        let erroresHtml = '<ul>';
    
        Object.keys(this.contactoForm.controls).forEach(controlName => {
          const control = this.contactoForm.get(controlName);
          if (control && control.invalid && control.errors) {
            const errores = control.errors;
            Object.keys(errores).forEach(errorKey => {
              let mensaje = '';
              switch (errorKey) {
                case 'required':
                  mensaje = 'es obligatorio';
                  break;
                case 'email':
                  mensaje = 'debe ser un correo válido';
                  break;
                case 'minlength':
                  mensaje = `debe tener al menos ${errores[errorKey].requiredLength} caracteres`;
                  break;
                // puedes agregar más casos aquí según tus validaciones
                default:
                  mensaje = `tiene error: ${errorKey}`;
              }
    
              erroresHtml += `<li><strong>${controlName}</strong>: ${mensaje}</li>`;
            });
          }
        });
    
        erroresHtml += '</ul>';
    
        Swal.fire({
          icon: 'error',
          title: 'Errores en el formulario',
          html: erroresHtml
        });
      }
    }
}
