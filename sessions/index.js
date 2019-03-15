'use strict';

const logger = require('../logger');
const redis = require('redis');
const config = require('config').get('redis');

const client = redis.createClient(config.port, config.host);

// Подключились к Redis'у
client.on('connect', () => {
  logger.log('info', 'Connection to Redis successfully established');
});

// Ошибка
client.on('error', err => {
  logger.log('error', err.message);
});

const store = (key, value) => {
  client.set(key, value); // Ключ - значение
  client.sadd(value, key); // Значение - [массив ключей] - для обратного поиска
};

const remove = key => {
  get(key)
    .then(value => {
      if (value) {
        client.srem(value, key);
      }
    });
  client.del(key);
};

const get = key => {
  return new Promise((resolve, reject) => {
    client.get(key, (err, item) => {
      if (err) {
        reject(err);
      }
      resolve(item);
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
  getAllByValue
};