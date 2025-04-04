import { Injectable } from '@angular/core';
import { toDataURL } from 'qrcode';

@Injectable({
  providedIn: 'root',
})
export class QrServiceService {
  constructor() {}

  async generarQRDataURL(qrText: string): Promise<string> {
    return await toDataURL(qrText);
  }

  async generarImagenCanvas(
    qrImageUrl: string,
    fecha: string
  ): Promise<string> {
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
