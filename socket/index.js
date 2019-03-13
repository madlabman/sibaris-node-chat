'use strict';

const Server = require('socket.io');
const socketIoJwt = require('socketio-jwt');
const events = require('./eventsTypes');
const handlers = require('./handlers');

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
        path: config.CHAT_SERVER_PATH
    });
    // Привязвка аутентификации по токену
    io.use(socketIoJwt.authorize({
        secret: config.JWT_AUTH_SECRET,
        handshake: true
    }));
    // Привязка событий
    io.on('connection', socket => {
        console.log({
            'socketId': socket.id,
            'login': socket.decoded_token.data.login
        });
        socket.on(events.GET_USERS, handlers.getUsersHandler)
    });
    return io;
};

module.exports = ioServer;