import { NextFunction, Request, RequestHandler, Response } from 'express';

export const wrapRequestHandler = <P>(func: RequestHandler<P, any, any, any>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    // Promise.resolve(func(req, res, next)).catch(next);
    try {
      await func(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
