'use strict';

const conversationModel = require('../db').models.conversation;

/**
 * Создание новой переписки между пользователями
 * @param {string} userId - Идентификатор пользователя 1
 * @param {string} partnerId - Идентификатор пользователя 2
 * @returns {Promise}
 */
const addConversation = (userId, partnerId) => {
  return new conversationModel({
    participants: [userId, partnerId]
  }).save();
};

/**
 * Получение переписки между пользователями
 * @param {string} userId - Идентификатор пользователя 1
 * @param {string} partnerId - Идентификатор пользователя 2
 * @returns {Promise}
 */
const findConversation = (userId, partnerId) => {
  return conversationModel.findOne({
    participants: {$all: [userId, partnerId]}
  }).exec();
};

/**
 * Возвращает переписку с указанным идентификатором
 * @param {string} conversationId
 * @returns {Promise}
 */
const getConversationById = conversationId => {
  return conversationModel.findById(conversationId).exec();
};

/**
 * Удаление переписки. Не приводит к удалению связанных сообщений
 * @param {mongoose.Model} conversation - Объект переписки
 * @returns {Promise}
 */
const removeConversation = conversation => {
  return conversationModel.deleteOne({
    _id: conversation._id
  }).exec();
};

module.exports = {
  addConversation,
  findConversation,
  getConversationById,
  removeConversation
};