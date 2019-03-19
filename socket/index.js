'use strict';

const logger = require('../logger');
const config = require('config').get('io');

const Server = require('socket.io');
const socketIoJwt = require('socketio-jwt');

const events = require('./eventsTypes');

const Session = require('../sessions');
const Conversation = require('../repository/conversation');
const Message = require('../repository/message');
const BackendNotifier = require('./backendNotifier');

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

  const broadcastToConversation = (conversationId, event, data) => {
    // Сокеты получаем по значениям в сессии
    Session.getSocketsByConversation(conversationId)
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
    const USER_ID = socket.decoded_token.data.userId;
    const PARTNER_ID = socket.decoded_token.data.partnerId;

    // Добавляем в сессию, ключ - идентификатор сокета, значение - идентификатор переписки
    // Подключение = переписка
    // Ищем переписку в базе данных
    Conversation.findConversation(USER_ID, PARTNER_ID)
      .then(conversation => {
        if (conversation) {
          Session.storeIoSession(conversation._id.toString(), socket.id, {
            userId: USER_ID,
            connectedAt: Date.now()
          });
        } else {
          Conversation.addConversation(USER_ID, PARTNER_ID)
            .then(conversation => {
              Session.storeIoSession(conversation._id.toString(), socket.id, {
                userId: USER_ID,
                connectedAt: Date.now(),
                newConversation: true
              });
            });
        }
      })
      .catch(err => {
        logger.log('error', err);
      });

    socket.on('disconnect', () => {
      Session.removeIoSession(socket.id); // При отключении сокет удаляется из сессии
    });

    // Запрос списка сообщений
    socket.on(events.GET_MESSAGES, page => {
      // Получаем идентификатор переписки из сессии
      Session.getConversationBySocket(socket.id)
        .then(conversationId => {
          if (conversationId) {
            Conversation.getConversationById(conversationId) // Находим переписку
              .then(conversation => {
                if (conversation) {
                  // Возвращаем в сокет массив сообщений
                  Message.getLastMessagesFromConversation(conversation, USER_ID, page)
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
      Session.getConversationBySocket(socket.id)
        .then(conversationId => {
          if (conversationId) {
            Conversation.getConversationById(conversationId) // Находим переписку
              .then(conversation => {
                if (conversation) {
                  // Добавляем новое сообщение
                  Message.addMessage(conversation, USER_ID, text)
                    .then(message => {
                      // Отправляем сообщение во все сокеты, связанные с перепиской
                      broadcastToConversation(conversationId, events.NEW_MESSAGE, message);
                      // Отправка уведомления на бэкенд
                      BackendNotifier.sendNotification(USER_ID, PARTNER_ID);
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
      Session.getConversationBySocket(socket.id)
        .then(conversationId => {
          if (conversationId) {
            Conversation.getConversationById(conversationId) // Находим переписку
              .then(conversation => {
                if (conversation) {
                  // Удаляем сообщения
                  Message.markMessagesAsDeleted(conversation, USER_ID)
                    .then(() => {
                      // Переписку можно не удалять
                      // Сообщаем всем клиентам, что надо очистить список сообщений
                      broadcastToConversation(conversationId, events.DELETE_MESSAGES, USER_ID);
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