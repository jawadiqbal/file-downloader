const express = require('express');
// const validate = require('express-validation');
// const schemas = require('../../config/param-validation');

const downloadController = require('./download');

// eslint-disable-next-line new-cap
const api = express.Router();

api.post('/', downloadController.download);

module.exports = api;
