// src/revalidation/revalidation.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RevalidationService {
  private readonly logger = new Logger(RevalidationService.name);
  // Asegúrate de tener la URL de tu frontend en las variables de entorno
  private readonly frontendUrl =
    process.env.FRONTEND_URL || 'http://localhost:3000';
  private readonly secret = process.env.REVALIDATION_SECRET;

  async notifyFrontend(
    table: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE' = 'UPDATE',
    id: string = '',
  ) {
    if (!this.secret) {
      this.logger.warn('REVALIDATION_SECRET no está configurado.');
      return;
    }

    try {
      // Hacemos el POST al endpoint de Next.js
      const response = await fetch(`${this.frontendUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidation-secret': this.secret, // Enviamos el secreto en los headers
        },
        body: JSON.stringify({ table, action, id }),
      });

      if (!response.ok) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const errorData = await response.json();
        this.logger.error(
          `Error revalidando tabla ${table}: ${JSON.stringify(errorData)}`,
        );
      } else {
        this.logger.log(
          `Revalidación solicitada con éxito para la tabla: ${table}`,
        );
      }
    } catch (error) {
      this.logger.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Fallo al conectar con el frontend para revalidar: ${error.message}`,
      );
    }
  }
}
