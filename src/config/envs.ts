import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;

  PRODUCTS_MS_HOST: string;
  PRODUCTS_MS_PORT: number;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    PRODUCTS_MS_HOST: joi.string().required(),
    PRODUCTS_MS_PORT: joi.number().required(),
  })
  .unknown(true);

const result = envsSchema.validate(process.env);

if (result.error) {
  throw new Error(`Config validations error ${result.error.message}`);
}

const envVars = result.value as EnvVars;

export const envs = {
  port: envVars.PORT,
  productsMS: {
    host: envVars.PRODUCTS_MS_HOST,
    port: envVars.PRODUCTS_MS_PORT,
  },
};
