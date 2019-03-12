'use strict';

// В продакшене параметры задаются переменными окружения
// При разработке использутся значения из конфига

module.exports = () => {
    if (process.env.NODE_ENV === 'production') {
        return {
            algorithm: process.env.jwtAlgorithm,
            secretKey: process.env.jwtSecret,
        }
    } else {
        return {
            algorithm: 'HS256',
            secretKey: 'some_secret_key'
        }
    }
};