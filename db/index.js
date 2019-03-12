'use strict';

const mongoose = require('mongoose');
const logger = require('../logger');
const config = require('./config')();

const dbURI = 'mongodb://' +
    encodeURIComponent(config.dbUser) + ':' +
    encodeURIComponent(config.dbPassword) + '@' +
    config.dbHost + ':' +
    config.dbPort + '/' +
    config.dbName;

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