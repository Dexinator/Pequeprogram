import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno desde .env

const app = express();
const port = process.env.PORT || 5000; // Usar puerto de .env o default 5000

app.get('/', (req: Request, res: Response) => {
  res.send('¡API de Entrepeques funcionando!');
});

app.listen(port, () => {
  console.log(`Servidor API escuchando en http://localhost:${port}`);
}); 