import { HttpService } from './http.service';

// HTTPS by default so the production POS (https://...vercel.app) doesn't trip
// mixed-content blocks. The bridge serves a self-signed cert that the user
// accepts once per machine. Override with PUBLIC_PRINT_BRIDGE_URL when running
// the POS locally over plain http for development.
const DEFAULT_BRIDGE_URL = 'https://localhost:9443';

export interface PrintTicketOptions {
  showSkuPerItem?: boolean;
  showStoreCredit?: boolean;
  showSaleBarcode?: boolean;
}

export interface PrintResult {
  ok: boolean;
  mode?: 'live' | 'dryrun';
  bytes?: number;
  message?: string;
  error?: string;
}

/**
 * Print Bridge service.
 *
 * Two-step flow:
 *  1) Fetch the format-agnostic payload from the backend (Heroku).
 *  2) POST it to the local bridge at localhost:9100, which renders ESC/POS
 *     or ZPL and either dry-runs (returns bytes) or sends to USB.
 *
 * The bridge URL can be overridden via PUBLIC_PRINT_BRIDGE_URL so individual
 * cashiers can point to different printers if needed.
 */
export class PrintBridgeService {
  private http: HttpService;
  private bridgeUrl: string;

  constructor() {
    this.http = new HttpService();
    this.bridgeUrl = this.resolveBridgeUrl();

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('entrepeques_auth_token');
      if (token) this.http.setAuthToken(token);
    }
  }

  private resolveBridgeUrl(): string {
    if (typeof window !== 'undefined') {
      const fromEnv = import.meta.env.PUBLIC_PRINT_BRIDGE_URL;
      if (fromEnv) return String(fromEnv).replace(/\/$/, '');
    }
    return DEFAULT_BRIDGE_URL;
  }

  /**
   * Quick liveness check. Used to show a "bridge offline" indicator in the UI
   * so the cashier knows before they press Print.
   */
  async checkHealth(): Promise<{ ok: boolean; mode?: string; location?: string }> {
    try {
      const res = await fetch(`${this.bridgeUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      });
      if (!res.ok) return { ok: false };
      const json = await res.json();
      return { ok: !!json.ok, mode: json.mode, location: json.location };
    } catch {
      return { ok: false };
    }
  }

  async printTicket(saleId: number, options: PrintTicketOptions = {}): Promise<PrintResult> {
    try {
      this.refreshAuthToken();
      const payloadResp = await this.http.get<any>(`/sales/${saleId}/ticket-payload`);
      const payload = payloadResp?.data;
      if (!payload || payload.version !== 1) {
        return { ok: false, error: 'El servidor devolvió un payload de ticket inválido o de versión desconocida.' };
      }

      const res = await fetch(`${this.bridgeUrl}/print/ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload,
          options: {
            show_sku_per_item: options.showSkuPerItem ?? false,
            show_store_credit: options.showStoreCredit ?? true,
            show_sale_barcode: options.showSaleBarcode ?? true,
          },
        }),
        signal: AbortSignal.timeout(10000),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        return {
          ok: false,
          error: json.error || `El bridge respondió ${res.status}.`,
        };
      }
      return { ok: true, mode: json.mode, bytes: json.bytes };
    } catch (err: any) {
      return {
        ok: false,
        error: this.translateNetworkError(err),
      };
    }
  }

  async printLabel(inventoryId: string, copies = 1): Promise<PrintResult> {
    try {
      this.refreshAuthToken();
      const payloadResp = await this.http.get<any>(`/inventory/${inventoryId}/label-payload`);
      const payload = payloadResp?.data;
      if (!payload || payload.version !== 1) {
        return { ok: false, error: 'El servidor devolvió un payload de etiqueta inválido o de versión desconocida.' };
      }

      const res = await fetch(`${this.bridgeUrl}/print/label`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, copies }),
        signal: AbortSignal.timeout(10000),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        return {
          ok: false,
          error: json.error || `El bridge respondió ${res.status}.`,
        };
      }
      return { ok: true, mode: json.mode, bytes: json.bytes };
    } catch (err: any) {
      return {
        ok: false,
        error: this.translateNetworkError(err),
      };
    }
  }

  private refreshAuthToken(): void {
    if (typeof localStorage === 'undefined') return;
    const token = localStorage.getItem('entrepeques_auth_token');
    if (token) this.http.setAuthToken(token);
  }

  private translateNetworkError(err: any): string {
    if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
      return 'El servicio de impresión local no respondió a tiempo. ¿Está corriendo en esta computadora?';
    }
    if (err instanceof TypeError) {
      return 'No se pudo conectar al servicio de impresión local. Verifica que esté corriendo.';
    }
    return err?.message || 'Error desconocido al imprimir.';
  }
}

export const printBridgeService = new PrintBridgeService();
