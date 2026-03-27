import { Resend } from 'resend';
import config from '../config';

interface OrderConfirmationItem {
  productName: string;
  sku?: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface OrderConfirmationData {
  orderId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderConfirmationItem[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  deliveryMethod: 'shipping' | 'pickup';
  shippingAddress?: {
    street?: string;
    neighborhood?: string;
    postal_code?: string;
    city?: string;
    state?: string;
  };
  paymentMethod: string;
}

interface AppointmentEmailData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  items: {
    subcategory_name: string;
    category_name: string;
    quantity: number;
    is_clothing: boolean;
  }[];
  totalItems: number;
  appointmentId: number;
}

class EmailService {
  private resend: Resend | null = null;

  private getClient(): Resend | null {
    if (!config.resendApiKey) {
      console.warn('RESEND_API_KEY no configurada — emails deshabilitados');
      return null;
    }
    if (!this.resend) {
      this.resend = new Resend(config.resendApiKey);
    }
    return this.resend;
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  private formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  }

  private buildItemsTableRows(items: AppointmentEmailData['items']): string {
    return items.map(item => `
      <tr>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #333;">
          ${item.subcategory_name}
          <span style="color: #888; font-size: 12px;">(${item.category_name}${item.is_clothing ? ' - Ropa' : ''})</span>
        </td>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #333; text-align: center;">
          ${item.quantity}
        </td>
      </tr>
    `).join('');
  }

  private buildClientConfirmationHtml(data: AppointmentEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ff6b9d, #ff8fab); border-radius: 12px 12px 0 0; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Entrepeques</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Cita de valuacion confirmada</p>
    </div>

    <!-- Body -->
    <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
      <p style="font-size: 16px; color: #333; margin: 0 0 20px;">
        Hola <strong>${data.clientName}</strong>,
      </p>
      <p style="font-size: 14px; color: #555; margin: 0 0 24px; line-height: 1.6;">
        Tu cita de valuacion ha sido confirmada. Aqui estan los detalles:
      </p>

      <!-- Appointment card -->
      <div style="background: #fff5f8; border: 1px solid #ffccd5; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 4px 0;">
              <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Fecha</span><br>
              <span style="color: #333; font-size: 16px; font-weight: 600; text-transform: capitalize;">${this.formatDate(data.appointmentDate)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 4px 0;">
              <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Horario</span><br>
              <span style="color: #333; font-size: 16px; font-weight: 600;">${this.formatTime(data.startTime)} - ${this.formatTime(data.endTime)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 4px 0;">
              <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Ubicacion</span><br>
              <span style="color: #333; font-size: 16px; font-weight: 600;">Entrepeques - Polanco</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Items table -->
      <h3 style="font-size: 14px; color: #333; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">
        Articulos a valuar (${data.totalItems} en total)
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background: #f9f9f9;">
            <th style="padding: 10px 16px; text-align: left; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Articulo</th>
            <th style="padding: 10px 16px; text-align: center; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          ${this.buildItemsTableRows(data.items)}
        </tbody>
      </table>

      <!-- Reminders -->
      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
        <h3 style="font-size: 14px; color: #92400e; margin: 0 0 12px;">Recuerda</h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #92400e; font-size: 13px; line-height: 1.8;">
          <li>Llega puntual a tu cita</li>
          <li>Trae todos los articulos que indicaste</li>
          <li>Los articulos deben estar limpios y en buen estado</li>
          <li>La valuacion dura aproximadamente 45 minutos</li>
        </ul>
      </div>

      <!-- Payment info -->
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 20px;">
        <h3 style="font-size: 14px; color: #075985; margin: 0 0 12px;">Formas de pago</h3>
        <ol style="margin: 0; padding: 0 0 0 20px; color: #075985; font-size: 13px; line-height: 1.8;">
          <li>Efectivo</li>
          <li>Credito en tienda (+20% extra al efectivo)</li>
          <li>Consignacion (se paga al venderse)</li>
        </ol>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px; color: #999; font-size: 12px;">
      <p style="margin: 0 0 4px;">Entrepeques - Articulos infantiles de segunda mano</p>
      <p style="margin: 0;">Polanco, Ciudad de Mexico</p>
    </div>
  </div>
</body>
</html>`;
  }

  private buildInternalNotificationHtml(data: AppointmentEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #2d3436; border-radius: 12px 12px 0 0; padding: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 20px;">Nueva Cita Agendada</h1>
      <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px;">Cita #${data.appointmentId}</p>
    </div>

    <div style="background: white; padding: 24px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
      <!-- Date/Time -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <table style="width: 100%;">
          <tr>
            <td>
              <strong style="color: #166534; text-transform: capitalize;">${this.formatDate(data.appointmentDate)}</strong><br>
              <span style="color: #166534;">${this.formatTime(data.startTime)} - ${this.formatTime(data.endTime)}</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Client info -->
      <h3 style="font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px;">Cliente</h3>
      <table style="width: 100%; margin-bottom: 20px; font-size: 14px;">
        <tr>
          <td style="padding: 4px 0; color: #888; width: 80px;">Nombre:</td>
          <td style="padding: 4px 0; color: #333; font-weight: 600;">${data.clientName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #888;">Telefono:</td>
          <td style="padding: 4px 0; color: #333;">${data.clientPhone || 'No proporcionado'}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #888;">Email:</td>
          <td style="padding: 4px 0; color: #333;">${data.clientEmail || 'No proporcionado'}</td>
        </tr>
      </table>

      <!-- Items -->
      <h3 style="font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px;">Articulos (${data.totalItems} total)</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f9f9f9;">
            <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #888;">Articulo</th>
            <th style="padding: 8px 12px; text-align: center; font-size: 12px; color: #888;">Cant.</th>
          </tr>
        </thead>
        <tbody>
          ${this.buildItemsTableRows(data.items)}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
  }

  async sendAppointmentConfirmation(data: AppointmentEmailData): Promise<{ clientSent: boolean; internalSent: boolean }> {
    const client = this.getClient();
    if (!client) {
      console.log('Email service no configurado — omitiendo envio de correos');
      return { clientSent: false, internalSent: false };
    }

    const results = { clientSent: false, internalSent: false };

    // Send confirmation to client
    if (data.clientEmail) {
      try {
        await client.emails.send({
          from: config.emailFrom,
          to: data.clientEmail,
          subject: `Cita confirmada - ${this.formatDate(data.appointmentDate)} a las ${this.formatTime(data.startTime)}`,
          html: this.buildClientConfirmationHtml(data),
        });
        results.clientSent = true;
        console.log(`Email de confirmacion enviado a ${data.clientEmail}`);
      } catch (error) {
        console.error('Error enviando email al cliente:', error);
      }
    }

    // Send notification to internal team
    try {
      await client.emails.send({
        from: config.emailFrom,
        to: config.notificationEmail,
        subject: `Nueva cita #${data.appointmentId} - ${data.clientName} - ${this.formatDate(data.appointmentDate)}`,
        html: this.buildInternalNotificationHtml(data),
      });
      results.internalSent = true;
      console.log(`Notificacion interna enviada a ${config.notificationEmail}`);
    } catch (error) {
      console.error('Error enviando notificacion interna:', error);
    }

    return results;
  }
  // ==========================================
  // CORREO DE CONFIRMACIÓN DE COMPRA ONLINE
  // ==========================================

  private buildOrderConfirmationHtml(data: OrderConfirmationData): string {
    const isPickup = data.deliveryMethod === 'pickup';
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0;">
          <div style="display: flex; align-items: center;">
            ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.productName}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; margin-right: 12px;">` : ''}
            <div>
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #333;">${item.productName}</p>
              ${item.sku ? `<p style="margin: 2px 0 0; font-size: 12px; color: #888;">SKU: ${item.sku}</p>` : ''}
            </div>
          </div>
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; text-align: center; font-size: 14px; color: #333;">${item.quantity}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; text-align: right; font-size: 14px; font-weight: 600; color: #333;">$${item.subtotal.toFixed(2)}</td>
      </tr>
    `).join('');

    const shippingHtml = isPickup ? `
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
        <h3 style="font-size: 14px; color: #166534; margin: 0 0 12px;">Recoger en Tienda</h3>
        <p style="margin: 0 0 4px; font-size: 14px; color: #333; font-weight: 600;">Av. Homero 1616</p>
        <p style="margin: 0 0 4px; font-size: 13px; color: #555;">Polanco I Secc, Miguel Hidalgo</p>
        <p style="margin: 0 0 12px; font-size: 13px; color: #555;">11510 Ciudad de Mexico, CDMX</p>
        <p style="margin: 0 0 4px; font-size: 12px; color: #166534;"><strong>Horario:</strong> Lun-Vie 11:00am - 7:30pm | Sab 11:00am - 6:30pm</p>
        <p style="margin: 0; font-size: 12px; color: #166534;"><strong>Tel:</strong> (55) 6588 3245 | <strong>WhatsApp:</strong> (55) 2363 2389</p>
      </div>
    ` : `
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
        <h3 style="font-size: 14px; color: #1e40af; margin: 0 0 12px;">Envio a Domicilio</h3>
        <p style="margin: 0 0 4px; font-size: 14px; color: #333; font-weight: 600;">${data.shippingAddress?.street || ''}</p>
        ${data.shippingAddress?.neighborhood ? `<p style="margin: 0 0 4px; font-size: 13px; color: #555;">Col. ${data.shippingAddress.neighborhood}</p>` : ''}
        <p style="margin: 0 0 4px; font-size: 13px; color: #555;">${data.shippingAddress?.city || ''}, ${data.shippingAddress?.state || ''}</p>
        <p style="margin: 0; font-size: 13px; color: #555;">CP: ${data.shippingAddress?.postal_code || ''}</p>
      </div>
    `;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ff6b9d, #ff8fab); border-radius: 12px 12px 0 0; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Entrepeques</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">¡Gracias por tu compra!</p>
    </div>

    <!-- Body -->
    <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
      <p style="font-size: 16px; color: #333; margin: 0 0 8px;">
        Hola <strong>${data.customerName}</strong>,
      </p>
      <p style="font-size: 14px; color: #555; margin: 0 0 24px; line-height: 1.6;">
        Tu pedido <strong>#${data.orderId}</strong> ha sido confirmado. Aqui estan los detalles:
      </p>

      <!-- Items table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background: #f9f9f9;">
            <th style="padding: 10px 16px; text-align: left; font-size: 12px; color: #888; text-transform: uppercase;">Producto</th>
            <th style="padding: 10px 16px; text-align: center; font-size: 12px; color: #888; text-transform: uppercase;">Cant.</th>
            <th style="padding: 10px 16px; text-align: right; font-size: 12px; color: #888; text-transform: uppercase;">Precio</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="background: #f9f9f9; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 4px 0; font-size: 14px; color: #555;">Subtotal:</td>
            <td style="padding: 4px 0; font-size: 14px; color: #333; text-align: right;">$${data.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-size: 14px; color: #555;">Envio:</td>
            <td style="padding: 4px 0; font-size: 14px; color: ${isPickup ? '#16a34a' : '#333'}; text-align: right;">
              ${isPickup ? 'Gratis' : `$${data.shippingCost.toFixed(2)}`}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0 0; font-size: 18px; font-weight: 700; color: #ff6b9d; border-top: 2px solid #e5e5e5;">Total:</td>
            <td style="padding: 8px 0 0; font-size: 18px; font-weight: 700; color: #ff6b9d; text-align: right; border-top: 2px solid #e5e5e5;">$${data.totalAmount.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <!-- Delivery info -->
      ${shippingHtml}

      <!-- Contact -->
      <div style="background: #fff5f8; border: 1px solid #ffccd5; border-radius: 10px; padding: 20px;">
        <h3 style="font-size: 14px; color: #9f1239; margin: 0 0 8px;">¿Tienes alguna duda?</h3>
        <p style="margin: 0; font-size: 13px; color: #555; line-height: 1.6;">
          Contactanos por WhatsApp al <a href="https://wa.me/525523632389" style="color: #16a34a; text-decoration: none; font-weight: 600;">(55) 2363 2389</a>
          o por telefono al <a href="tel:+525565883245" style="color: #2563eb; text-decoration: none;">(55) 6588 3245</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px; color: #999; font-size: 12px;">
      <p style="margin: 0 0 4px;">Entrepeques - Articulos infantiles de segunda mano</p>
      <p style="margin: 0;">Av. Homero 1616, Polanco, CDMX</p>
    </div>
  </div>
</body>
</html>`;
  }

  async sendOrderConfirmation(data: OrderConfirmationData): Promise<{ clientSent: boolean; internalSent: boolean }> {
    const client = this.getClient();
    if (!client) {
      console.log('Email service no configurado — omitiendo correo de confirmacion de pedido');
      return { clientSent: false, internalSent: false };
    }

    const results = { clientSent: false, internalSent: false };

    // Enviar confirmación al cliente
    if (data.customerEmail) {
      try {
        await client.emails.send({
          from: config.emailFrom.replace('citas@', 'tienda@'),
          to: data.customerEmail,
          subject: `Pedido #${data.orderId} confirmado - Entrepeques`,
          html: this.buildOrderConfirmationHtml(data),
        });
        results.clientSent = true;
        console.log(`Email de confirmacion de pedido enviado a ${data.customerEmail}`);
      } catch (error) {
        console.error('Error enviando email de confirmacion al cliente:', error);
      }
    }

    // Notificación interna
    try {
      await client.emails.send({
        from: config.emailFrom,
        to: config.notificationEmail,
        subject: `Nuevo pedido online #${data.orderId} - ${data.customerName} - $${data.totalAmount.toFixed(2)}`,
        html: this.buildOrderConfirmationHtml(data),
      });
      results.internalSent = true;
      console.log(`Notificacion de pedido enviada a ${config.notificationEmail}`);
    } catch (error) {
      console.error('Error enviando notificacion interna de pedido:', error);
    }

    return results;
  }
}

export const emailService = new EmailService();
