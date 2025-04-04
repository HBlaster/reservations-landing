import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertServiceService {

  constructor() { }

  mostrarErroresFormulario(errores: string): void {
    Swal.fire({ icon: 'error', title: 'Errores en el formulario', html: errores });
  }

  mostrarErrorEnvio(): void {
    Swal.fire({ icon: 'error', title: 'Error', text: 'Error al enviar el formulario' });
  }

  async mostrarConfirmacionConQR(qrUrl: string, email: string, fecha: string, descargaCb: () => void): Promise<void> {
    await Swal.fire({
      title: 'Reservación confirmada',
      html: `
        <h3>Su acceso será enviado al correo electrónico:<br>${email}</h3>
        <img id="qr-image" src="${qrUrl}" alt="QR" style="margin-top:10px;" />
        <p style="font-size:11px;">Válido para: ${fecha}</p>
        <p style="margin-top:10px; font-size:12px;">Este código será escaneado para validar su reservación</p>
        <button id="btn-download-qr" style="...">Descargar QR</button>
      `,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#a97c50',
      didOpen: () => {
        const container = Swal.getHtmlContainer();
        const btn = container?.querySelector('#btn-download-qr') as HTMLButtonElement;
        if (btn) btn.addEventListener('click', descargaCb);
      }
    });
  }
}
