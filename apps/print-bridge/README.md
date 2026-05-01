# Entrepeques Print Bridge

Local Node.js service that runs on the store PC and translates the
backend's `TicketPayload v1` and `LabelPayload v1` into ESC/POS bytes
(for the Epson TM-T88IV) and ZPL programs (for the Zebra GC420t).

The POS frontend (Vercel) calls this bridge at `localhost:9100` because
Heroku and Vercel cannot reach the USB devices in the store directly.

## Quick start (development)

```bash
cd apps/print-bridge
cp .env.example .env
npm install
npm run dev
```

Then:

```bash
curl http://localhost:9100/health
```

## Render modes

- `RENDER_MODE=dryrun` (default): the bridge accepts payloads and returns
  the rendered ESC/POS / ZPL in the response without sending bytes to a
  printer. Useful for development and CI.
- `RENDER_MODE=live`: the bridge writes the bytes to the configured USB
  printer. **Not implemented yet** — to be wired up during the in-store
  installation phase, where USB device paths and permissions can be
  verified per OS.

## API

| Method | Path             | Body                         | Description |
|--------|------------------|------------------------------|-------------|
| GET    | `/health`        | —                            | Liveness + capabilities |
| POST   | `/print/ticket`  | `{ payload, options? }`      | Render a sale ticket |
| POST   | `/print/label`   | `{ payload, copies? }`       | Render a product label (1–10 copies) |

Payloads must match the v1 schemas defined in `src/types/schemas.ts`.
These mirror `packages/api/src/models/ticket.model.ts` and
`packages/api/src/models/label.model.ts`. Any breaking change on the
backend must bump the `version` field and update both sides together.

## Build for production

```bash
npm run build
node dist/index.js
```

The runtime needs Node ≥ 20.

## Next steps (deferred)

1. Implement the USB transport in `src/printers/dispatcher.ts` for both
   Linux (write to `/dev/usb/lp*`) and Windows (`node-usb` or print to a
   queued printer name via `escpos-usb` / `node-printer`).
2. Package as an OS service (Linux: systemd unit; Windows:
   `node-windows` or NSSM).
3. Self-signed HTTPS certificate so the Vercel POS (HTTPS) can reach
   `https://localhost:9100` without mixed-content blocks.
