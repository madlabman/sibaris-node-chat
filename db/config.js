'use strict';

// В продакшене параметры задаются переменными окружения
// При разработке использутся значения из конфига

module.exports = () => {
    if (process.env.NODE_ENV === 'production') {
        return {
            dbUser: process.env.dbUser,
            dbPassword: process.env.dbPassword,
            dbHost: process.env.dbHost,
            dbPort: process.env.dbHost,
            dbName: process.env.dbName
        }
    } else {
        return {
            dbUser: 'chat-user',
            dbPassword: '1234',
            dbHost: '127.0.0.1',
            dbPort: 27017,
            dbName: 'sibaris-chat'
        }
    }
};