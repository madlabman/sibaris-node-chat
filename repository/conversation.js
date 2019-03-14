'use strict';

const conversationModel = require('../db').models.conversation;

// Создает новую переписку между пользователями
const addConversation = (userId, partnerId) => {
  return new conversationModel({
    participants: [userId, partnerId]
  });
};

// Получает переписку между пользователями
const getConversation = (userId, partnerId, cb) => {
  conversationModel.findOne({
    participants: {$all: [userId, partnerId]}
  })
    .exec(cb);
};

// Удаление переписки
// Не приводит к удалению связанных сообщений
const deleteConversation = (conversation, cb) => {
  conversationModel.deleteOne({
    _id: conversation._id
  }, cb);
};

module.exports = {
  addConversation,
  getConversation,
  deleteConversation
};