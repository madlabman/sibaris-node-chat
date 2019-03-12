'use strict';

const logger = require('./logger');
const server = require('http').createServer();
const io = require('./socket')(server);

const SERVER_PORT = 3000; // TODO: Перенести в конфиг

// io.on('connection', socket => {
//     logger.log('A user connected');
// });

server.listen(SERVER_PORT, err => {
    if (err) throw err;
    logger.log('info', `Starting listening server on port ${SERVER_PORT}`);
});
