import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
  })
  .unknown(true);

const result = envsSchema.validate(process.env);

if (result.error) {
  throw new Error(`Config validations error ${result.error.message}`);
}

const envVars = result.value as EnvVars;

export const envs = {
  port: envVars.PORT,
};
