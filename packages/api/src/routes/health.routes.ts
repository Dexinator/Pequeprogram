import { Router, Request, Response } from 'express';
import { pool } from '../db';

/**
 * `GET /api/health` — lo que el CLAUDE.md documenta desde el principio y nunca
 * existió: hasta ahora respondía 404 en local, en staging y en producción.
 *
 * Verificar un despliegue a mano se hacía por el 401 de una ruta protegida,
 * que confirma que el código nuevo está arriba pero no dice nada de la base de
 * datos. Este responde las dos cosas.
 *
 * Es público a propósito: un chequeo que necesita credenciales no sirve para
 * monitoreo. Por eso también responde lo mínimo —si está vivo y si la base
 * contesta— y nunca la versión del motor, el nombre de la base ni la cadena de
 * conexión.
 */
const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  let dbClient;
  try {
    dbClient = await pool.connect();
    await dbClient.query('SELECT 1');
    res.json({
      success: true,
      status: 'ok',
      database: 'ok',
      uptime_seconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // 503 y no 500: el proceso está vivo, lo que falla es la dependencia, y es
    // el código que un balanceador o un monitor interpreta como "no me mandes
    // tráfico todavía".
    console.error('[health] la base de datos no respondió:', error);
    res.status(503).json({
      success: false,
      status: 'degraded',
      database: 'error',
      uptime_seconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  } finally {
    if (dbClient) dbClient.release();
  }
});

export default router;
