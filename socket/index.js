'use strict';

const logger = require('../logger');
const config = require('config').get('io');

const Server = require('socket.io');
const socketIoJwt = require('socketio-jwt');

const events = require('./eventsTypes');

const Session = require('../sessions');
const User = require('../repository/user');
const Conversation = require('../repository/conversation');
const Message = require('../repository/message');

const ioServer = server => {
  const io = new Server(server, {
    path: config.socket_path,
    transports: ['websocket']
  });

  // Привязка аутентификации по токену
  io.use(socketIoJwt.authorize({
    secret: config.jwt_key,
    handshake: true,
    success: (data, accept) => {
      if (data.request) {
        // Добавляем проверку наличия в токене параметра partnerId
        const partnerId = data.decoded_token.data && data.decoded_token.data.partnerId;
        if (partnerId) {
          accept();
        }
      } else {
        accept(null, true);
      }
    }
  }));

  const broadcastToConversation = (sessionValue, event, data) => {
    // Сокеты получаем по значениям в сессии
    Session.getAllByValue(sessionValue)
      .then(sockets => {
        sockets.forEach(socket => {
          io.to(socket).emit(event, data);
        })
      })
      .catch(err => {
        logger.log('error', err);
      });
  };

  // Привязка событий
  io.on('connection', socket => {
    // Парсинг переменных подключения
    const userId = socket.decoded_token.data.userId; // TODO: Обновить readme
    const partnerId = socket.decoded_token.data.partnerId;

    // Добавляем в сессию, ключ - идентификатор сокета, значение - идентификатор переписки
    // Подключение = переписка
    // Ищем переписку в базе данных
    Conversation.findConversation(userId, partnerId)
      .then(conversation => {
        if (conversation) {
          Session.store(socket.id, conversation._id.toString());
        } else {
          Conversation.addConversation(userId, partnerId)
            .then(conversation => {
              Session.store(socket.id, conversation._id.toString());
            });
        }
      })
      .catch(err => {
        logger.log('error', err);
      });

    socket.on('disconnect', () => {
      Session.remove(socket.id); // При отключении сокет удаляется из сессии
    });

    // Запрос списка сообщений
    socket.on(events.GET_MESSAGES, page => {
      // Получаем идентификатор переписки из сессии
      Session.get(socket.id)
        .then(conversationId => {
          if (conversationId) {
            Conversation.getConversationById(conversationId) // Находим переписку
              .then(conversation => {
                if (conversation) {
                  // Возвращаем в сокет массив сообщений
                  Message.getLastMessagesFromConversation(conversation, page)
                    .then(messages => {
                      socket.emit(events.MESSAGES_LIST, messages);
                    })
                }
              })
              .catch(err => {
                logger.log('error', err);
              })
          }
        });
    });

    // Отправка нового сообщения
    socket.on(events.SEND_MESSAGE, text => {
      // Получаем идентификатор переписки из сессии
      Session.get(socket.id)
        .then(conversationId => {
          if (conversationId) {
            Conversation.getConversationById(conversationId) // Находим переписку
              .then(conversation => {
                if (conversation) {
                  // Добавляем новое сообщение
                  Message.addMessage(conversation, userId, text)
                    .then(message => {
                      // Отправляем сообщение во все сокеты, связанные с перепиской
                      broadcastToConversation(conversationId, events.NEW_MESSAGE, message);
                    });
                }
              })
              .catch(err => {
                logger.log('error', err);
              })
          }
        });
    });

    // Удаление сообщений
    socket.on(events.DELETE_MESSAGES, () => {
      // Получаем идентификатор переписки из сессии
      Session.get(socket.id)
        .then(conversationId => {
          if (conversationId) {
            Conversation.getConversationById(conversationId) // Находим переписку
              .then(conversation => {
                if (conversation) {
                  // Удаляем сообщения
                  Message.removeMessagesFromConversation(conversation)
                    .then(() => {
                      // Переписку можно не удалять
                      // Сообщаем всем клиентам, что надо очистить список сообщений
                      broadcastToConversation(conversationId, events.DELETE_MESSAGES, null);
                    });
                }
              })
              .catch(err => {
                logger.log('error', err);
              })
          }
        });
    });
  });

  return io;
};

module.exports = ioServer;