'use strict';

const logger = require('./logger');
const server = require('http').createServer();
const io = require('./socket')(server);
const config = require('config').get('server');

server.listen(config.port, err => {
    if (err) throw err;
    logger.log('info', `Starting listening server on port ${config.port}`);
});
