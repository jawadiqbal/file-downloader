const Joi = require('joi');

module.exports = {
  // POST /api/url-shortener
  urlShortenerRequestBody: {
    body: {
      baseUrl: Joi.string().uri().required(),
      params: Joi.object().required()
    }
  }
};
