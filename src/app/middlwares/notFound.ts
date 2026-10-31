/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 404 Not Found Middleware
 * This middleware handles all unmatched routes gracefully.
 */

import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'API endpoint not found!',
    error: {
      path: req.originalUrl,
      method: req.method,
      suggestion: 'Please check your API route or HTTP method.',
    },
  });
};

export default notFound;
