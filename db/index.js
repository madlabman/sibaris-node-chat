'use strict';

const mongoose = require('mongoose');
const logger = require('../logger');
const config = require('config').get('mongo');

const dbURI = 'mongodb://' +
  encodeURIComponent(config.user) + ':' +
  encodeURIComponent(config.password) + '@' +
  config.host + ':' +
  config.port + '/' +
  config.db;

mongoose.Promise = global.Promise; // Default promise is deprecated
mongoose.set('useCreateIndex', true); // Suppress warning
mongoose.connect(dbURI, {useNewUrlParser: true})
  .then(() => {
      logger.log('info', 'Connection to MongoDB successfully established')
    },
    err => {
      logger.log('error', err);
    }
  );

module.exports = {
  mongoose,
  models: {
    user: require('./schemas/user'),
    message: require('./schemas/message'),
    conversation: require('./schemas/conversation')
  }
};