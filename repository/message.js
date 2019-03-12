'use strict';

const messageModel = require('../db').models.message;

const MESSAGES_PER_PAGE = 30; // Максимальное количество сообщений, которое можно получить за раз

// Добавление нового сообщения в переписку
const addMessage = (conversation, sender, body) => {
    new messageModel({
        conversationId: conversation._id,
        sender: sender._id,
        body
    })
        .save(cb);
};

// Постраничная загрузка послдених сообщений из переписки
const getLastMessagesFromConversation = (conversation, page, cb) => {
    messageModel.find({
        conversationId: conversation._id
    })
        .sort('-createdAt')
        .skip(page * MESSAGES_PER_PAGE) // Постраничная загрузка
        .limit(MESSAGES_PER_PAGE)
        .exec(cb);
};

// Удаление сообщений из переписки
const removeMessagesFromConversation = (conversation, cb) => {
    messageModel.remove({
        conversationId: conversation._id
    }, cb);
};

module.exports = {
    addMessage,
    getLastMessagesFromConversation,
    removeMessagesFromConversation
};