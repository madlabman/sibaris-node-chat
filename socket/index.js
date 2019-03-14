'use strict';

const logger = require('../logger');

const Server = require('socket.io');
const socketIoJwt = require('socketio-jwt');
const events = require('./eventsTypes');

const session = require('../sessions');

const User = require('../repository/user');
const Conversation = require('../repository/conversation');
const Message = require('../repository/message');

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

  // Привязка аутентификации по токену
  io.use(socketIoJwt.authorize({
    secret: config.JWT_AUTH_SECRET,
    handshake: true
  }));

  // Проверка получения partnerId при рукопожатии
  io.use((socket, next) => {
    const partnerId = socket.handshake.query.partnerId;
    if (!partnerId) {
      return next(new Error('PartnerIdIsNotProvidedError'))
    }
    return next();
  });

  // Привязка событий
  io.on('connection', socket => {
    // Парсинг переменных подключения
    const userId = socket.decoded_token.data.userId; // TODO: Обновить readme
    const partnerId = socket.handshake.query.partnerId;

    session.saveSocket(socket); // При подключениии пользователя запоминаем сессию

    socket.on('disconnect', () => {
      session.removeSocketFromSession(socket); // При отключении сокет удаляется из сессии
    });

    // Запрос списка сообщений
    socket.on(events.GET_MESSAGES, page => {
      Conversation.getConversation(userId, partnerId, (err, conversation) => {
        if (err) {
          logger.log('error', err);
          return;
        }

        if (conversation) {
          Message.getLastMessagesFromConversation(conversation, parseInt(page), (err, messages) => {
            if (err) {
              logger.log('error', err);
              return;
            }

            socket.emit(events.MESSAGES_LIST, messages);
          });
        }
      });
    });

    // Отправка нового сообщения
    socket.on(events.SEND_MESSAGE, message => {
      // Пробуем получить переписку
      Conversation.getConversation(userId, partnerId, (err, conversation) => {
        if (err) {
          logger.log('error', err);
          return;
        }

        if (!conversation) { // Если переписка не найдена
          conversation = Conversation.addConversation(userId, partnerId);
          conversation.save();
        }
        // Добавляем новое сообщение
        Message.addMessage(conversation, userId, message, (err, dbMessage) => {
          if (err) {
            logger.log('error', err);
            return;
          }

          // Отправляем во все сокеты с этой перепиской
          session.getSessionConnections(socket, (err, socketIds) => {
            if (err) {
              logger.log('error', err);
              return;
            }

            if (socketIds) {
              socketIds.forEach(id => {
                io.to(id).emit(events.NEW_MESSAGE, dbMessage); // Новое сообщение
              });
            }
          });
        });
      });
    });
  });

  return io;
};

module.exports = ioServer;