import { Request, Response, NextFunction } from 'express';

// Type helper for Express 5 compatibility
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any> | any;