import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).required();

export const registerSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(1).max(120).required(),
  password: Joi.string().required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  profilePicture: Joi.string().allow('').optional(),
}).required();

export const createPatientSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  age: Joi.number().integer().min(1).max(120).required(),
  dysgraphiaSeverity: Joi.string().required(),
  attentionProfile: Joi.string().required(),
}).required();

export const gameConfigSchema = Joi.object({
  difficulty: Joi.string().valid('Facile', 'Normal', 'Difficile').required(),
  durationSeconds: Joi.number().valid(30, 60, 90, 120, 150, 180).required(),
  mode: Joi.string().valid('Mot exact', 'Mot à trous').required(),
  theme: Joi.string().valid('Football', 'Espace').required(),
}).required();

export const sessionNotesSchema = Joi.object({
  notes: Joi.string().allow('').required(),
}).required();
