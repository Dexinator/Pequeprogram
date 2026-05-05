# Entrepeques Print Bridge

Local Node.js service that runs on the store PC and translates the
backend's `TicketPayload v1` and `LabelPayload v1` into ESC/POS bytes
(Epson TM-T88IV) and ZPL programs (Zebra GC420t).

The POS frontend (Vercel) calls this bridge at `https://localhost:9443`
because Heroku and Vercel cannot reach the USB devices in the store
directly.

---

## Requisitos previos

- **Node.js 20** o superior. Bajar el instalador desde
  [nodejs.org](https://nodejs.org/) y elegir "LTS".
- **Drivers oficiales** de las dos impresoras instalados en Windows:
  - Epson TM-T88IV: driver "OPOS" o "Advanced Printer Driver" (APD)
    desde la página de soporte de Epson.
  - Zebra GC420t: driver ZDesigner desde la página de Zebra.
- Después de instalar los drivers, anota el **nombre exacto** que
  aparece en *Windows → Configuración → Impresoras y escáneres*. Lo
  necesitarás para el archivo `.env`.

## Instalación rápida (Windows, una sola vez)

Abre **PowerShell como administrador** en la carpeta del bridge y
ejecuta:

```powershell
cd C:\ruta\a\Pequeprogram\apps\print-bridge
copy .env.example .env
notepad .env                # ajusta los valores marcados abajo
npm install
npm run build
npm run service:install
```

`service:install` registra `EntrepequesPrintBridge` como servicio de
Windows. Arranca solo cada vez que prendes la PC y se reinicia si se
cae. Para desinstalarlo: `npm run service:uninstall`.

### Variables que tienes que ajustar en `.env`

```ini
ENABLE_HTTPS=true
EPSON_PRINTER_NAME=NOMBRE EXACTO DE LA EPSON
ZEBRA_PRINTER_NAME=NOMBRE EXACTO DE LA ZEBRA
RENDER_MODE=live
LABEL_WIDTH_DOTS=400      # ajusta cuando Pablo confirme el rollo
LABEL_HEIGHT_DOTS=200
CORS_ORIGINS=https://pos.entrepeques.com,https://pequeprogram-pos.vercel.app,https://pequeprogram-pos-git-development-dexinator.vercel.app
```

> El nombre de la impresora es **case-sensitive** y debe coincidir
> *exactamente* con el de "Dispositivos e impresoras" (incluyendo
> espacios y mayúsculas). Tip: en PowerShell `Get-Printer | Select Name`.

### Confiar el cert local en el navegador (una sola vez)

Como la POS vive en `https://...vercel.app`, el navegador exige que el
bridge también hable HTTPS. La primera vez que se prenda la caja,
abre `https://localhost:9443/health` en el mismo navegador donde se
usará el POS y acepta el certificado autofirmado. A partir de ahí no
vuelve a preguntar.

## Modos de renderizado

- `RENDER_MODE=dryrun` (default): el bridge acepta payloads y devuelve
  los bytes/ZPL en la respuesta sin imprimir. Ideal para probar la
  comunicación POS ↔ bridge antes de tocar las impresoras.
- `RENDER_MODE=live`: el bridge envía bytes a las impresoras
  configuradas. En Windows usa el spooler vía Win32 winspool.drv. En
  Linux escribe directamente al device path (`/dev/usb/lpN`).

## API

| Method | Path             | Body                      | Description |
|--------|------------------|---------------------------|-------------|
| GET    | `/health`        | —                         | Liveness + capabilities + render mode |
| POST   | `/print/ticket`  | `{ payload, options? }`   | Imprime un ticket de venta |
| POST   | `/print/label`   | `{ payload, copies? }`    | Imprime una etiqueta (1–10 copias) |

Los payloads deben cumplir los esquemas v1 en `src/types/schemas.ts`,
que reflejan los modelos del backend en
`packages/api/src/models/*.model.ts`. Si el backend rompe compatibilidad
debe subir el campo `version` y actualizarse ambos lados.

## Desarrollo local (Linux / macOS)

```bash
cd apps/print-bridge
cp .env.example .env
npm install
npm run dev
curl http://localhost:9100/health
```

En Linux, para que el modo `live` escriba a `/dev/usb/lp0` el usuario
debe estar en el grupo `lp` o tener una regla udev que conceda acceso.

## Troubleshooting

| Síntoma | Diagnóstico |
|---------|-------------|
| Botón "Imprimir" muestra "No se pudo conectar al servicio de impresión local" | El servicio no está corriendo o el navegador no aceptó el cert. Abre `https://localhost:9443/health` y acepta el certificado. |
| `OpenPrinter falló para 'EPSON TM-T88IV Receipt'` | El nombre de la impresora en `.env` no coincide. `Get-Printer` en PowerShell muestra los nombres exactos. |
| El ticket sale con caracteres raros (acentos) | El renderer ya usa `PC858_EURO` (latin-1 ext.). Si persisten, revisa que el driver esté en modo "raw" y no "Generic Text". |
| La etiqueta sale descuadrada | Ajusta `LABEL_WIDTH_DOTS` y `LABEL_HEIGHT_DOTS` al tamaño real del rollo (8 dots/mm a 203 dpi). 50×25 mm = 400×200 dots. |
