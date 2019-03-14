'use strict';

const logger = require('../logger');
const Server = require('socket.io');
const socketIoJwt = require('socketio-jwt');
const events = require('./eventsTypes');
const session = require('../sessions');
const User = require('../repository/user');

const config = (() => {
    if (process.env.NODE_ENV === 'production') {
        return {
            CHAT_SERVER_PATH: process.env.chatServerPath,
            JWT_AUTH_SECRET: process.env.jwtAuthSecret
        }
    } else {
        return {
            CHAT_SERVER_PATH: '/chat',
            JWT_AUTH_SECRET: 'some_secret_key'
        }
    }
})(); // TODO: Возможно, слить все в один конфиг

const ioServer = server => {
    const io = new Server(server, {
        path: config.CHAT_SERVER_PATH,
        transports: ['websocket']
    });
    // Привязвка аутентификации по токену
    io.use(socketIoJwt.authorize({
        secret: config.JWT_AUTH_SECRET,
        handshake: true
    }));
    // Привязка событий
    io.on('connection', socket => {

        const socketLogin = socket.decoded_token.data.login;
        session.addSocketByLogin(socketLogin, socket.id); // При подключениии пользователя записывать ID сокета в redis
        socket.on('disconnect', () => {
            session.removeSocketByLogin(socketLogin, socket.id); // При отключении сокет выпиливается из списка
        });

        socket.emit('hello', 'can you hear me?', 1, 2, 'abc');

        socket.on(events.GET_USERS, () => {

            User.getAll((err, users) => {
                if (err) {
                    logger.log('error', err);
                    return;
                }
                // Отправка данных обратно в сокет
                socket.emit(events.USERS_LIST, users);
            })
        })
    });
    return io;
};

module.exports = ioServer;