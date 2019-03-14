'use strict';

const logger = require('../logger');
const redis = require('redis');

const config = (() => {
    if (process.env.NODE_ENV === 'production') {
        return {
            REDIS_HOST: process.env.redisHost,
            REDIS_PORT: process.env.redisPort
        }
    } else {
        return {
            REDIS_HOST: '127.0.0.1',
            REDIS_PORT: '6379'
        }
    }
})();

const client = redis.createClient(config.REDIS_PORT, config.REDIS_HOST);

client.on('connect', () => {
    logger.log('info', 'Connection to Redis successfully established');
});

client.on('error', err => {
    logger.log('error', err.message);
});

const addSocketByLogin = (login, socketId) => {
    client.sadd(login, socketId);
};

const getSocketsByLogin = (login, cb) => {
    client.smembers(login, cb);
};

const removeSocketByLogin = (login, socket) => {
    client.srem(login, socket);
};

module.exports = {
    client,
    addSocketByLogin,
    getSocketsByLogin,
    removeSocketByLogin
};