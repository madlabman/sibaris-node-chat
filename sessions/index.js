'use strict';

const logger = require('../logger');
const redis = require('redis');
const config = require('config').get('redis');
const redisScan = require('node-redis-scan');

const client = redis.createClient(config.port, config.host);
const scanner = new redisScan(client);

// Подключились к Redis'у
client.on('connect', () => {
  logger.log('info', 'Connection to Redis successfully established');
});

// Ошибка
client.on('error', err => {
  logger.log('error', err.message);
});

const store = (key, value) => {
  client.set(key, JSON.stringify(value)); // Ключ - значение
};

/**
 * Сохраняет сессию для сокета и переписки
 * @param {string} conversationId - Идентификатор переписки
 * @param {string} socketId - Идентификатор сокета
 * @param {object} data - Данные для записи в сессию
 */
const storeIoSession = (conversationId, socketId, data = {}) => {
  const key = `io:${conversationId}:${socketId}`; // <conversation_id>:<socket_id>
  const value = {
    updatedAt: Date.now(),
    ...data // Разворачивает поля объекта data
  } // Данные для записи
  store(key, JSON.stringify(value));
};

/**
 * Удаляет сессию, связанную с сокетом
 * @param {string} socketId - Идентификатор сокета
 */
const removeIoSession = socketId => {
  // Найти ключи по маске и удалить
  scanner.scan(`io:*:${socketId}`, (err, keys) => {
    if (err) {
      logger.log('error', `Unable to SCAN redis keys: ${err}`);
      return;
    }

    keys.forEach(key => {
      remove(key);
    });
  });
};

/**
 * Получение списка сокетов по идентификатору переписки
 * @param {string} conversationId - Идентификатор переписки
 * @returns {Promise}
 */
const getSocketsByConversation = conversationId => {
  return new Promise((resolve, reject) => {
    scanner.scan(`io:${conversationId}:*`, (err, keys) => {
      if (err) {
        reject(err);
      }
      // Получение сокетов - парсим ключ, чтобы не делать лишний запрос
      const sockets = [];
      keys.forEach(key => {
        const keyArray = key.split(':');
        sockets.push(keyArray[2]);
      });
      resolve(sockets);
    });
  });
};

/**
 * Получения переписки по идентификатору сокета
 * @param {string} socketId - Идентификатор сокета
 * @returns {Promise}
 */
const getConversationBySocket = socketId => {
  return new Promise((resolve, reject) => {
    scanner.scan(`io:*:${socketId}`, (err, keys) => {
      if (err) {
        reject(err);
      }
      // Получение переписки - парсим ключ, чтобы не делать лишний запрос
      if (keys.length) {
        resolve(keys[0].split(':')[1])
      }
      reject();
    });
  });
};

const remove = key => {
  client.del(key);
};

const get = key => {
  return new Promise((resolve, reject) => {
    client.get(key, (err, item) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(item));
    })
  });
};

const getAllByValue = value => {
  return new Promise((resolve, reject) => {
    client.smembers(value, (err, items) => {
      if (err) {
        reject(err);
      }
      resolve(items);
    });
  });
};

module.exports = {
  client,
  store,
  remove,
  get,
  storeIoSession,
  removeIoSession,
  getSocketsByConversation,
  getConversationBySocket
};