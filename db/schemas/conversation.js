'use strict';

const mongoose = require('mongoose');

// Схема диалогов
const conversationSchema = mongoose.Schema({
  participants: [{ // Каждый диалог хранит список участников
    type: mongoose.Schema.Types.Number
  }]
});

module.exports = mongoose.model('Conversation', conversationSchema);