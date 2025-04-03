import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ReservationServiceService } from '../../services/reservation-service.service';
import { toDataURL } from 'qrcode';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  contactoForm: FormGroup;

  condiciones: boolean = true;
  constructor(private router: Router, private fb: FormBuilder, private reservationService: ReservationServiceService) {
    this.contactoForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      OfficialId: ['', Validators.required],
      reservationDay: ['', Validators.required],
      // condiciones: [false, Validators.requiredTrue] // si decides incluir el checkbox
    });
  }
  ngOnInit() {}

  onSubmit(): void {
    if (this.contactoForm.valid) {
      // Swal.fire('Éxito', 'Formulario enviado correctamente', 'success');
      this.reservationService
        .createReservation(this.contactoForm.value)
        .subscribe(
          async (response:any) => {
            console.log('Formulario recibido:', response);
            const qrText = response.qr;
            const qrImageUrl = await toDataURL(qrText);

            Swal.fire({
              title: 'Reservación confirmada',
              html: `
                <h3>Su acceso sera enviado al correo electronico: ${this.contactoForm.value.email}</h3>
                <img src="${qrImageUrl}" alt="QR" style="margin-top:10px;" />
                <p style="margin-top:10px; font-size:12px;">Este codigo sera escaneado vara validar su reservación</p>
              `,
              icon: 'success',
              confirmButtonText: 'OK',
              confirmButtonColor: '#a97c50'
            });

            this.contactoForm.reset(); 
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error al enviar el formulario',
            });
          }
        );
        
    } else {
      let erroresHtml = '<ul>';

      Object.keys(this.contactoForm.controls).forEach((controlName) => {
        const control = this.contactoForm.get(controlName);
        if (control && control.invalid && control.errors) {
          const errores = control.errors;
          Object.keys(errores).forEach((errorKey) => {
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
        html: erroresHtml,
      });
    }
  }

  reservationClicked() {
    this.router.navigate(['/reservation']);
  }
}
