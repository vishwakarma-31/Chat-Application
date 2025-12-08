import { Request, Response, NextFunction } from 'express';
import Joi, { ObjectSchema } from 'joi';

// Validation schemas
export const userRegistrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phoneNumber: Joi.string().optional(),
  displayName: Joi.string().optional()
});

export const userLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

export const linkPreviewSchema = Joi.object({
  url: Joi.string().uri().required()
});

// Generic validation middleware
export const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => ({
          message: detail.message,
          path: detail.path
        }))
      });
    }
    
    next();
  };
};