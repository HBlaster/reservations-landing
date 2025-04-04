import { Component } from '@angular/core';
import { Router } from '@angular/router'; 
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { toDataURL } from 'qrcode';
import { ReservationServiceService } from '../../services/reservation-service.service';

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
        this.procesarReserva();
      } else {
        this.mostrarErroresFormulario();
      }
    }

    private procesarReserva(): void {
        this.reservationService.createReservation(this.contactoForm.value).subscribe(
          async (response: any) => {
            await this.mostrarConfirmacionConQR(response.qr);
            this.contactoForm.reset();
          },
          () => {
            this.mostrarErrorEnvio();
          }
        );
      }
    
      private mostrarErroresFormulario(): void {
        let erroresHtml = '<ul>';
      
        Object.keys(this.contactoForm.controls).forEach((controlName) => {
          const control = this.contactoForm.get(controlName);
          if (control?.invalid && control.errors) {
            Object.keys(control.errors).forEach((errorKey) => {
              let mensaje = '';
              switch (errorKey) {
                case 'required':
                  mensaje = 'es obligatorio';
                  break;
                case 'email':
                  mensaje = 'debe ser un correo válido';
                  break;
                case 'minlength':
                  mensaje = `debe tener al menos ${control.errors![errorKey].requiredLength} caracteres`;
                  break;
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
    
      private mostrarErrorEnvio(): void {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al enviar el formulario',
        });
      }
    
      private async mostrarConfirmacionConQR(qrText: string): Promise<void> {
        const qrImageUrl = await toDataURL(qrText);
        const formattedDate = this.contactoForm.value.reservationDay.replace('T', ' ').replace('Z', '');
      
        await Swal.fire({
          title: 'Reservación confirmada',
          html: `
            <h3>Su acceso será enviado al correo electrónico:<br>${this.contactoForm.value.email}</h3>
            <img id="qr-image" src="${qrImageUrl}" alt="QR" style="margin-top:10px;" />
            <p style="font-size:11px;">Válido para: ${formattedDate}</p>
            <p style="margin-top:10px; font-size:12px;">Este código será escaneado para validar su reservación</p>
            <button id="btn-download-qr" style="
              margin-top:12px;
              background-color:#a97c50;
              color:white;
              border:none;
              padding:8px 16px;
              border-radius:6px;
              cursor:pointer;
              font-size:14px;
            ">Descargar QR</button>
          `,
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#a97c50',
          didOpen: () => this.configurarDescargaQR(qrImageUrl, formattedDate),
        });
      }
    
      private configurarDescargaQR(qrImageUrl: string, formattedDate: string): void {
        const container = Swal.getHtmlContainer();
        const downloadBtn = container?.querySelector('#btn-download-qr') as HTMLButtonElement;
        const qrImg = container?.querySelector('#qr-image') as HTMLImageElement;
      
        if (!downloadBtn || !qrImg) return;
      
        downloadBtn.addEventListener('click', async () => {
          const imagenDescargable = await this.generarImagenCanvas(qrImageUrl, formattedDate);
          const link = document.createElement('a');
          link.href = imagenDescargable;
          link.download = `reserva_${Date.now()}.png`;
          link.click();
        });
      }
    
      private async generarImagenCanvas(qrImageUrl: string, fecha: string): Promise<string> {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const width = 300;
        const height = 400;
        const imgSize = 160;
      
        canvas.width = width;
        canvas.height = height;
      
        // fondo blanco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      
        // título
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Acceso', width / 2, 40);
      
        // cargar imagen QR
        const img = new Image();
        img.src = qrImageUrl;
        await img.decode();
        ctx.drawImage(img, (width - imgSize) / 2, 70, imgSize, imgSize);
      
        // fecha
        ctx.font = '14px Arial';
        ctx.fillText(`Fecha del evento: ${fecha}`, width / 2, 260);
      
        // instrucciones
        ctx.font = '12px Arial';
        ctx.fillText('Este código valida tu reservación', width / 2, 290);
      
        return canvas.toDataURL('image/png');
      }
}
