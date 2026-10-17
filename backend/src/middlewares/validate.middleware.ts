import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

export function validateBody(schema: Joi.ObjectSchema) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(request.body, {
      abortEarly: false,
      convert: true,
    });

    if (error) {
      response.status(400).json({
        error: 'Invalid request body',
        details: error.details.map((detail) => ({
          message: detail.message,
          path: detail.path,
          type: detail.type,
        })),
      });
      return;
    }

    request.body = value;
    next();
  };
}
