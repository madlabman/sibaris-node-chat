'use strict';

const jwt = require('jsonwebtoken');
const logger = require('../logger');
const config = require('./config')();

const verify = token => { // Проверка токена JWT
    try {
        return jwt.verify(token, config.secretKey, {
            algorithms: [config.algorithm]
        }, (err, decoded) => {
            if (err) {
                logger.log('warn', err.message); // Пишем ошибку в лог
                return false;
            } else {
                return decoded && decoded.data && decoded.data.login; // Ожидаем увидеть поле login
            }
        });
    } catch (err) {
        logger.err('error', err);
        return false;
    }
};

module.exports = {
    verify
};