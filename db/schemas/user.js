'use strict';

const mongoose = require('mongoose');

// Иконка пользователя по умолчанию
const DEFAULT_AVATAR_URI = 'https://cdn2.iconfinder.com/data/icons/website-icons/512/User_Avatar-512.png';

// Схема пользователя в базе данных чата
// Для связи моделей между базами подразумевается, что поле логин уникально и хранится в нижнем регистре
const userSchema = mongoose.Schema({
    login: {
        type: mongoose.Schema.Types.String,
        lowercase: true,
        unique: true,
        required: true
    },
    name: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    avatar: {
        type: mongoose.Schema.Types.String,
        default: DEFAULT_AVATAR_URI
    }
});

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;