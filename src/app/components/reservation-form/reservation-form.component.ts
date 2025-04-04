import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ReservationServiceService } from '../../services/reservation-service.service';
import { QrServiceService } from '../../services/qr-service.service';
import { AlertServiceService } from '../../services/alert-service.service';
import { generarErroresFormulario } from '../../utils/form-error.util';


@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.css',
})
export class ReservationFormComponent {
  contactoForm: FormGroup;

  condiciones: boolean = true;
  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationServiceService,
    private qrService: QrServiceService,
    private alertService: AlertServiceService
  ) {
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
      this.procesarReserva();
    } else {
      const errores = generarErroresFormulario(this.contactoForm);
      this.alertService.mostrarErroresFormulario(errores);
    }
  }

  private async procesarReserva(): Promise<void> {
    this.reservationService
      .createReservation(this.contactoForm.value)
      .subscribe(
        async (res: any) => {
          const qrUrl = await this.qrService.generarQRDataURL(res.qr);
          const fecha = this.contactoForm.value.reservationDay
            .replace('T', ' ')
            .replace('Z', '');
          const descargaCb = async () => {
            const imagen = await this.qrService.generarImagenCanvas(
              qrUrl,
              fecha
            );
            const link = document.createElement('a');
            link.href = imagen;
            link.download = `reserva_${Date.now()}.png`;
            link.click();
          };
          await this.alertService.mostrarConfirmacionConQR(
            qrUrl,
            this.contactoForm.value.email,
            fecha,
            descargaCb
          );
          this.contactoForm.reset();
        },
        () => this.alertService.mostrarErrorEnvio()
      );
  }
}
