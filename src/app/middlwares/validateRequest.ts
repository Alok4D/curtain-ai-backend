import { ZodObject, ZodRawShape } from 'zod';
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utlis/catchAsync';

const validateRequest = (schema: ZodObject<ZodRawShape>) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await schema.parseAsync({
      body: req.body,
      cookies: req.cookies,
      query: req.query,
      params: req.params,
    });
    next();
  });
};

export default validateRequest;
