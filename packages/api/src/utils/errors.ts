/**
 * Error de negocio: el usuario hizo algo que no procede (stock insuficiente,
 * pagos que no cuadran, crédito que no alcanza…). NO es una falla del sistema.
 *
 * Existe porque sin esto el middleware de errores no podía distinguirlos de una
 * caída real y los devolvía como 500 "Error interno del servidor": la cajera
 * veía ese mensaje en vez de "Stock insuficiente para el producto X" y no sabía
 * qué corregir.
 */
export class BusinessError extends Error {
  /** El middleware de errores usa este código en la respuesta. */
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'BusinessError';
    this.status = status;
    Object.setPrototypeOf(this, BusinessError.prototype);
  }
}
