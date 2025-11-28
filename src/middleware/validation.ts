import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const personalizationSchema = Joi.object({
  userId: Joi.string().required(),
  contentType: Joi.string().valid('email', 'push_notification', 'sms').required(),
  template: Joi.string().required(),
  subject: Joi.string().optional()
});

export const validatePersonalizationRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = personalizationSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details[0].message
    });
  }
  
  next();
};