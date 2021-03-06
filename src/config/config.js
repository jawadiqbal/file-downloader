const Joi = require('joi');

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['local', 'dev', 'test', 'live'])
    .default('local'),
  PORT: Joi.number()
    .default(4040),
  DOWNLOAD_PATH: Joi.string()
    .default('downloads')
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
  downloadPath: envVars.DOWNLOAD_PATH
};

module.exports = config;
