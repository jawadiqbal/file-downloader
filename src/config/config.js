const Joi = require('joi');

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['local', 'dev', 'test', 'live'])
    .default('local'),
  PORT: Joi.number()
    .default(4040)
}).unknown().required();

const {
  error,
  value: envVars
} = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  postgres: {
    host: envVars.POSTGRES_HOST,
    port: envVars.POSTGRES_PORT,
    db: envVars.POSTGRES_DB,
    user: envVars.POSTGRES_USER,
    pass: envVars.POSTGRES_PASS
  }
};

module.exports = config;
