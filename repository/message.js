'use strict';

const messageModel = require('../db').models.message;

/**
 * Максимальное количество сообщений, которое можно получить за раз
 * @constant
 * @type {number}
 */
const MESSAGES_PER_PAGE = 30;

/**
 * Добавление нового сообщения в переписку
 * @async
 * @param {mongoose.Model} conversation - Объект переписки
 * @param {string} senderId - Идентификатор пользователя
 * @param {string} body - Текст сообщения
 * @returns {Promise}
 */
const addMessage = (conversation, senderId, body) => {
  return new messageModel({
    conversationId: conversation._id,
    sender: senderId,
    body
  }).save();
};

/**
 * Постраничная загрузка последних сообщений из переписки
 * @async
 * @param {mongoose.Model} conversation - Объект переписки
 * @param {string} userId - Идентификатор пользователя
 * @param {number} page - Страница для выдачи (начиная с нуля)
 * @returns {Promise}
 */
const getLastMessagesFromConversation = (conversation, userId, page) => {
  if (!page) page = 0;
  return messageModel.find({
    conversationId: conversation._id,
    deletedFor: {
      $nin: [userId]
    }
  })
    .sort('-createdAt')
    .skip(page * MESSAGES_PER_PAGE) // Постраничная загрузка
    .limit(MESSAGES_PER_PAGE)
    .exec();
};

/**
 * Удаление сообщений из переписки
 * @param {mongoose.Model} conversation - Объект переписки
 * @returns {Promise}
 */
const removeMessagesFromConversation = conversation => {
  return messageModel.remove({
    conversationId: conversation._id
  }).exec();
};

/**
 * Пометка сообщений как удаленных
 * @param conversation
 * @param userId
 * @returns {Promise}
 */
const markMessagesAsDeleted = (conversation, userId) => {
  return messageModel.updateMany({
    conversationId: conversation._id
  }, {
    $push: {
      deletedFor: userId
    }
  }).exec();
};

module.exports = {
  addMessage,
  getLastMessagesFromConversation,
  removeMessagesFromConversation,
  markMessagesAsDeleted
};