'use strict';

const Server = require('socket.io');
const events = require('./eventsTypes');
const handlers = require('./handlers');

const CHAT_SERVER_PATH = (() => {
    if (process.env.NODE_ENV === 'production') {
        return process.env.chatServerPath;
    } else {
        return '/chat';
    }
})(); // TODO: Возможно, слить все в один конфиг

const ioServer = server => {
    const io = new Server(server, {
        path: CHAT_SERVER_PATH
    });
    // Привязка событий
    io.on('connection', socket => {
        socket.on(events.GET_USERS, handlers.getUsersHandler)
    });
    return io;
};

module.exports = ioServer;