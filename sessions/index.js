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

const getSessionKeyFromSocket = socket => {
  // Для пары пользователей выбирает один ключ - комбинация id этих пользователей
  // Данные пользователей извлекаются из токена, переданного при авторизации
  // Тем самым сторонний сервер дает доступ пользователю к диалогу с другим пользователем
  return [
    socket.decoded_token.data.userId,
    socket.decoded_token.data.partnerId
  ].sort().join(':'); // Получает что-то вроде abc:def, где abc и def - идентификаторы пользователей
};

// В текущей модели сессия представляет собой чат между двумя пользователями
// Ключ сессии может быть получен из токена
// Как вариант в качестве ключа сессии можно использовать идентификатор модели Conversation из базы данных
const saveSocket = socket => {
  const sessionKey = getSessionKeyFromSocket(socket);
  client.sadd(sessionKey, socket.id); // Мы сохраняем в список id сокета, чтобы отправлять сообщения во все подключения пользователей-участников
};

const getSessionConnections = (socket, cb) => {
  client.smembers(getSessionKeyFromSocket(socket), cb);
};

const removeSocketFromSession = socket => {
  client.srem(getSessionKeyFromSocket(socket), socket.id);
};

module.exports = {
  client,
  saveSocket,
  getSessionConnections,
  removeSocketFromSession
};