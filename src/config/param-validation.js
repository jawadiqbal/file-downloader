const Joi = require('joi');

module.exports = {
  // POST /api/url-shortener
  downloadRequestBody: {
    body: {
      url: Joi.string()
        .uri()
        .required()
      // protocol: Joi.string().required()
    }
  }
};
