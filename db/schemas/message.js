'use strict';

const mongoose = require('mongoose');

// Схема сообщений
// Каждое сообщение хранится как отдельный документ в целях производительности на больших диалогах
// Если хранить сообщения как вложенный массив переписки, документ может сильно разрастись
// Хранение сообщений в отдельных документах также позволяет легко масштабировать базу данных
const messageSchema = mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    body: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true // Автоматически управляет полями createdAt и updatedAt
});

const messageModel = mongoose.model('Message', messageSchema);

module.exports = messageModel;