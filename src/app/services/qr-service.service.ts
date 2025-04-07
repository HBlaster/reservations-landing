import { Injectable } from '@angular/core';
import { toDataURL } from 'qrcode';

@Injectable({
  providedIn: 'root',
})
export class QrService {
  constructor() {}

  async generateQRDataURL(qrText: string): Promise<string> {
    return await toDataURL(qrText);
  }

  async generateCanvasImage(qrImageUrl: string, date: string): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const width = 300;
    const height = 400;
    const imgSize = 160;

    canvas.width = width;
    canvas.height = height;

    // white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Acceso', width / 2, 40);

    // load QR image
    const img = new Image();
    img.src = qrImageUrl;
    await img.decode();
    ctx.drawImage(img, (width - imgSize) / 2, 70, imgSize, imgSize);

    // date
    ctx.font = '14px Arial';
    ctx.fillText(`Fecha del evento: ${date}`, width / 2, 260);

    // instructions
    ctx.font = '12px Arial';
    ctx.fillText('Este código valida tu reservación', width / 2, 290);

    return canvas.toDataURL('image/png');
  }
}
