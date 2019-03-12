'use strict';

const conversationModel = require('../db').models.conversation;

// Создает новую переписку между пользователями
const addConversation = (user, partner, cb) => {
    new conversationModel({
        participants: [user._id, partner._id]
    })
        .save(cb);
};

// Получает переписку между пользователями
const getConversation = (user, partner, cb) => {
    conversationModel.find({
        participants: [user._id, partner._id]
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